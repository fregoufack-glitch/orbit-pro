import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../lib/supabase';
import { darkTheme, lightTheme, Theme, getLevelForXP, BADGES, SECRET_BADGES, LEVELS } from '../constants/theme';
import { setLanguage, loadLanguage, getLanguage } from '../i18n';
import { Session, User } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { syncTimezone, detectTimezone, todayInTimezone } from '../services/timezone';
import { startRealtimeSync, stopRealtimeSync, fullSync, getAffectedCollections } from '../services/realtimeSync';
import {
  configureNotifications,
  requestPermissions as requestNotifPermissions,
  rescheduleAllNotifications,
} from '../services/notifications';
import { registerBackgroundSync, triggerForegroundSync } from '../services/backgroundTasks';

// ============================================
// TYPES
// ============================================

export interface Profile {
  id: string;
  pseudo: string;
  email: string;
  avatar_url: string | null;
  custom_title: string;
  language: string;
  theme: string;
  accent_color: string;
  xp: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  last_active_date: string | null;
  onboarding_completed: boolean;
  gdpr_consent: boolean;
  notification_enabled: boolean;
  notification_time: string;
  timezone: string;
  bio: string;
  mood_emoji: string;
  mood_text: string;
  banner_url: string | null;
  badge_showcase: string[];
  streak_style: string;
  card_style: string;
  animation_style: string;
  notification_sound: string;
  privacy: string;
  streak_freezes_available: number;
  streak_freeze_used_at: string | null;
  quiet_hours_start: string;
  quiet_hours_end: string;
  objectives: string[];
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  color: string;
  category: string;
  frequency: string;
  custom_days: number[];
  target_time: string | null;
  duration_minutes: number;
  reminder_enabled: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  completedToday?: boolean;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  completed_at: string;
  xp_earned: number;
}

export interface PlannedActivity {
  id: string;
  user_id: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string | null;
  color: string;
  emoji: string;
  is_completed: boolean;
  notes: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_emoji: string;
  badge_description: string;
  earned_at: string;
}

export interface DailyMission {
  id: string;
  title: string;
  completed: boolean;
  target: number;
  current: number;
}

interface AppContextType {
  // Auth
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, pseudo: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;

  // Theme
  theme: Theme;
  themeMode: 'dark' | 'light';
  accentColor: string;
  setThemeMode: (mode: 'dark' | 'light') => void;
  setAccentColor: (color: string) => void;

  // Language
  language: string;
  changeLanguage: (lang: string) => void;

  // Timezone
  userTimezone: string;

  // Profile
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  deleteAccount: () => Promise<void>;

  // Habits
  habits: Habit[];
  loadHabits: () => Promise<void>;
  createHabit: (habit: Partial<Habit>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string) => Promise<{ xpEarned: number; levelUp: boolean; perfectDay: boolean; badges: string[] }>;

  // Completions
  todayCompletions: HabitCompletion[];
  loadCompletions: (date?: string) => Promise<HabitCompletion[]>;

  // Planner
  activities: PlannedActivity[];
  loadActivities: (date?: string) => Promise<void>;
  createActivity: (activity: Partial<PlannedActivity>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<PlannedActivity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  // Gamification
  badges: UserBadge[];
  dailyMissions: DailyMission[];
  loadBadges: () => Promise<void>;
  refreshMissions: () => void;

  // Stats
  loadDailyStats: (days?: number) => Promise<any[]>;

  // GDPR
  gdprAccepted: boolean;
  acceptGDPR: () => Promise<void>;

  // Onboarding
  onboardingDone: boolean;
  completeOnboarding: (objectives: string[]) => Promise<void>;

  // Celebration
  showCelebration: boolean;
  celebrationMessage: string;
  dismissCelebration: () => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeModeState] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColorState] = useState('#00D9A5');
  const [language, setLang] = useState('fr');
  const [userTimezone, setUserTimezone] = useState('UTC');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<HabitCompletion[]>([]);
  const [activities, setActivities] = useState<PlannedActivity[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // Refs for stable access in callbacks
  const profileRef = useRef<Profile | null>(null);
  const habitsRef = useRef<Habit[]>([]);
  const activitiesRef = useRef<PlannedActivity[]>([]);

  profileRef.current = profile;
  habitsRef.current = habits;
  activitiesRef.current = activities;

  function getToday(): string {
    return todayInTimezone(userTimezone);
  }

  const theme: Theme = {
    ...(themeMode === 'dark' ? darkTheme : lightTheme),
    accent: accentColor,
    success: accentColor,
  };

  // ============================================
  // APP STATE LISTENER (foreground/background)
  // ============================================
  useEffect(() => {
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  function handleAppStateChange(nextState: AppStateStatus) {
    if (nextState === 'active' && profileRef.current) {
      // App came to foreground — silently sync timezone & refresh data
      console.log('[app] Came to foreground, syncing...');
      syncTimezone(profileRef.current.id).then(tz => setUserTimezone(tz));
      triggerForegroundSync();
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      // Configure notifications handler
      configureNotifications();

      // Register background sync task
      await registerBackgroundSync();

      // Load language preference
      const lang = await loadLanguage();
      setLang(lang);

      // Detect timezone immediately
      const tz = detectTimezone();
      setUserTimezone(tz);

      // Check GDPR
      const gdpr = await AsyncStorage.getItem('orbit_gdpr');
      setGdprAccepted(gdpr === 'true');

      // Check session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        await hydrateUser(session.user.id);
      }
    } catch (e) {
      console.error('Init error:', e);
    } finally {
      setLoading(false);
    }

    // Auth state listener
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        hydrateUser(session.user.id);
      } else {
        teardownUser();
      }
    });
  }

  /**
   * Full user hydration: fetch all data, start realtime, sync timezone, schedule notifications.
   */
  async function hydrateUser(userId: string) {
    console.log('[app] Hydrating user:', userId);

    // 1. Full sync from Supabase
    const data = await fullSync(userId);

    // 2. Hydrate profile
    if (data.profile) {
      const p = data.profile as Profile;
      setProfile(p);
      profileRef.current = p;
      setThemeModeState(p.theme as 'dark' | 'light');
      setAccentColorState(p.accent_color || '#00D9A5');
      setLanguage(p.language || 'fr');
      setLang(p.language || 'fr');
      setOnboardingDone(p.onboarding_completed);
      setUserTimezone(p.timezone || detectTimezone());
    }

    // 3. Hydrate habits with today's completion status
    const today = todayInTimezone(data.profile?.timezone || detectTimezone());
    const todayCompletionsList = (data.completions as HabitCompletion[]).filter(c => c.completed_date === today);
    const completedIds = new Set(todayCompletionsList.map(c => c.habit_id));
    const hydratedHabits = (data.habits as Habit[]).map(h => ({
      ...h,
      completedToday: completedIds.has(h.id),
    }));
    setHabits(hydratedHabits);
    habitsRef.current = hydratedHabits;
    setTodayCompletions(todayCompletionsList);

    // 4. Hydrate activities
    setActivities(data.activities as PlannedActivity[]);
    activitiesRef.current = data.activities as PlannedActivity[];

    // 5. Hydrate badges
    setBadges(data.badges as UserBadge[]);

    // 7. Refresh missions
    refreshMissionsWithData(todayCompletionsList.length);

    // 8. Sync timezone silently in background
    syncTimezone(userId).then(tz => setUserTimezone(tz));

    // 9. Start realtime subscriptions
    startRealtimeSync(userId, handleRealtimeEvent);

    // 10. Schedule notifications
    const p = data.profile as Profile | null;
    if (p?.notification_enabled) {
      await rescheduleAllNotifications({
        habits: data.habits as any[],
        activities: data.activities as any[],
        notificationEnabled: true,
        notificationTime: p.notification_time || '20:00',
        pseudo: p.pseudo,
        language: p.language,
        timezone: p.timezone || detectTimezone(),
      });
    }

    // 11. Trigger foreground sync (updates widget)
    await triggerForegroundSync();
  }

  /**
   * Teardown when user signs out.
   */
  function teardownUser() {
    stopRealtimeSync();
    setProfile(null);
    setHabits([]);
    setTodayCompletions([]);
    setActivities([]);
    setBadges([]);
    
    
  }

  // ============================================
  // REALTIME EVENT HANDLER
  // ============================================
  function handleRealtimeEvent(table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', record: any) {
    console.log(`[realtime] ${table} ${eventType}`);
    const collections = getAffectedCollections(table);

    // Refresh affected data
    for (const col of collections) {
      switch (col) {
        case 'profile':
          if (record && table === 'profiles') {
            setProfile(prev => prev ? { ...prev, ...record } : record);
          }
          break;
        case 'habits':
          loadHabits();
          break;
        case 'completions':
          loadCompletions(getToday());
          break;
        case 'activities':
          loadActivities();
          break;
        case 'badges':
          loadBadges();
          break;
        case 'dailyStats':
          // Stats are loaded on-demand, no need to refresh eagerly
          break;
      }
    }

    // Reschedule notifications if habits or activities changed
    if (table === 'habits' || table === 'planned_activities') {
      const p = profileRef.current;
      if (p?.notification_enabled) {
        // Small delay to let state settle
        setTimeout(() => {
          rescheduleAllNotifications({
            habits: habitsRef.current,
            activities: activitiesRef.current,
            notificationEnabled: true,
            notificationTime: p.notification_time || '20:00',
            pseudo: p.pseudo,
            language: p.language,
            timezone: p.timezone || detectTimezone(),
          });
        }, 500);
      }
    }

    // Update widget on any data change
    triggerForegroundSync();
  }

  // ============================================
  // AUTH
  // ============================================
  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    // hydrateUser is called by onAuthStateChange
    return {};
  }

  async function signUp(email: string, password: string, pseudo: string) {
    const tz = detectTimezone();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        pseudo,
        email,
        xp: 0,
        level: 1,
        streak_days: 0,
        longest_streak: 0,
        onboarding_completed: false,
        gdpr_consent: true,
        gdpr_consent_date: new Date().toISOString(),
        timezone: tz,
      });
      if (profileError) return { error: profileError.message };
      setUserTimezone(tz);
    }
    return {};
  }

  async function signOut() {
    teardownUser();
    await supabase.auth.signOut();
  }

  // ============================================
  // THEME
  // ============================================
  function setThemeMode(mode: 'dark' | 'light') {
    setThemeModeState(mode);
    if (profile) {
      supabase.from('profiles').update({ theme: mode }).eq('id', profile.id).then();
    }
  }

  function setAccentColor(color: string) {
    setAccentColorState(color);
    if (profile) {
      supabase.from('profiles').update({ accent_color: color }).eq('id', profile.id).then();
    }
  }

  // ============================================
  // LANGUAGE
  // ============================================
  function changeLanguage(lang: string) {
    setLanguage(lang);
    setLang(lang);
    if (profile) {
      supabase.from('profiles').update({ language: lang }).eq('id', profile.id).then();
    }
  }

  // ============================================
  // PROFILE
  // ============================================
  async function updateProfile(updates: Partial<Profile>) {
    if (!profile) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', profile.id);
    if (!error) {
      setProfile({ ...profile, ...updates });
    }
  }

  async function deleteAccount() {
    if (!profile) return;
    stopRealtimeSync();
    await supabase.from('habit_completions').delete().eq('user_id', profile.id);
    await supabase.from('habits').delete().eq('user_id', profile.id);
    await supabase.from('planned_activities').delete().eq('user_id', profile.id);
    await supabase.from('user_badges').delete().eq('user_id', profile.id);
    await supabase.from('daily_stats').delete().eq('user_id', profile.id);
    await supabase.from('profiles').delete().eq('id', profile.id);
    await signOut();
  }

  // ============================================
  // HABITS
  // ============================================
  async function loadHabits() {
    if (!user) return;
    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('sort_order');

    if (data) {
      const today = getToday();
      const completions = await loadCompletions(today);
      const completedIds = new Set(completions.map(c => c.habit_id));
      const h = data.map(h => ({ ...h, completedToday: completedIds.has(h.id) }));
      setHabits(h);
      habitsRef.current = h;
    }
  }

  async function createHabit(habit: Partial<Habit>) {
    if (!user) return;
    const { error } = await supabase.from('habits').insert({
      ...habit,
      user_id: user.id,
    });
    if (!error) {
      await loadHabits();
      await checkBadges();
    }
  }

  async function updateHabit(id: string, updates: Partial<Habit>) {
    const { error } = await supabase.from('habits').update(updates).eq('id', id);
    if (!error) await loadHabits();
  }

  async function deleteHabit(id: string) {
    await supabase.from('habits').update({ is_active: false }).eq('id', id);
    await loadHabits();
  }

  async function toggleHabitCompletion(habitId: string) {
    if (!user || !profile) return { xpEarned: 0, levelUp: false, perfectDay: false, badges: [] };

    const today = getToday();
    const existing = todayCompletions.find(c => c.habit_id === habitId);
    let xpEarned = 0;
    let levelUp = false;
    let perfectDay = false;
    let newBadges: string[] = [];

    if (existing) {
      await supabase.from('habit_completions').delete().eq('id', existing.id);
      const newXP = Math.max(0, (profile.xp || 0) - 10);
      await updateProfile({ xp: newXP });
    } else {
      xpEarned = 10;
      await supabase.from('habit_completions').insert({
        habit_id: habitId,
        user_id: user.id,
        completed_date: today,
        xp_earned: 10,
      });

      if (profile.streak_days > 0) xpEarned += 20;

      const newCompletions = await loadCompletions(today);
      const activeHabits = habits.filter(h => h.is_active);

      if (activeHabits.length > 0 && newCompletions.length >= activeHabits.length) {
        perfectDay = true;
        xpEarned += 50;
      }

      const newXP = (profile.xp || 0) + xpEarned;
      const currentLevel = getLevelForXP(profile.xp || 0);
      const newLevel = getLevelForXP(newXP);
      if (newLevel.level > currentLevel.level) levelUp = true;

      let newStreak = profile.streak_days || 0;
      let freezeUpdates: Partial<Profile> = {};
      if (profile.last_active_date !== today) {
        const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
        if (profile.last_active_date === yesterday) {
          newStreak += 1;
        } else if (
          profile.last_active_date &&
          newStreak > 0 &&
          (profile.streak_freezes_available || 0) > 0
        ) {
          // Streak freeze: save the streak instead of resetting
          freezeUpdates = {
            streak_freezes_available: 0,
            streak_freeze_used_at: new Date().toISOString(),
          } as any;
          // Keep the streak, don't increment
        } else {
          newStreak = 1;
        }

        // Refill streak freeze weekly (if last used > 7 days ago or never used)
        const lastFreezeUsed = profile.streak_freeze_used_at ? new Date(profile.streak_freeze_used_at) : null;
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
        if (
          (profile.streak_freezes_available || 0) < 1 &&
          (!lastFreezeUsed || lastFreezeUsed < sevenDaysAgo)
        ) {
          freezeUpdates.streak_freezes_available = 1;
        }
      }

      await updateProfile({
        xp: newXP,
        level: newLevel.level,
        streak_days: newStreak,
        longest_streak: Math.max(newStreak, profile.longest_streak || 0),
        last_active_date: today,
        ...freezeUpdates,
      });

      await supabase.from('daily_stats').upsert({
        user_id: user.id,
        date: today,
        habits_completed: newCompletions.length,
        habits_total: activeHabits.length,
        xp_earned: xpEarned,
        perfect_day: perfectDay,
        streak_count: newStreak,
      }, { onConflict: 'user_id,date' });

      newBadges = await checkBadges();

      if (levelUp) {
        triggerCelebration(`🎉 ${getLanguage() === 'fr' ? 'Niveau supérieur !' : 'Level up!'} Level ${newLevel.level}`);
      } else if (perfectDay) {
        triggerCelebration(`⭐ ${getLanguage() === 'fr' ? 'Journée parfaite ! +50 XP' : 'Perfect day! +50 XP'}`);
      } else if (xpEarned > 10) {
        triggerCelebration(`🔥 +${xpEarned} XP!`);
      }
    }

    await loadCompletions(today);
    await loadHabits();
    refreshMissions();
    triggerForegroundSync(); // Update widget

    return { xpEarned, levelUp, perfectDay, badges: newBadges };
  }

  // ============================================
  // COMPLETIONS
  // ============================================
  async function loadCompletions(date?: string): Promise<HabitCompletion[]> {
    if (!user) return [];
    const d = date || getToday();
    const { data } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed_date', d);

    const completions = (data || []) as HabitCompletion[];
    if (d === getToday()) setTodayCompletions(completions);
    return completions;
  }

  // ============================================
  // PLANNER
  // ============================================
  async function loadActivities(date?: string) {
    if (!user) return;
    let query = supabase
      .from('planned_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time');

    if (date) query = query.eq('date', date);

    const { data } = await query;
    if (data) {
      setActivities(data as PlannedActivity[]);
      activitiesRef.current = data as PlannedActivity[];
    }
  }

  async function createActivity(activity: Partial<PlannedActivity>) {
    if (!user) return;
    await supabase.from('planned_activities').insert({ ...activity, user_id: user.id });
    await loadActivities(activity.date);
    // Notification for this activity is scheduled by the realtime handler
  }

  async function updateActivity(id: string, updates: Partial<PlannedActivity>) {
    await supabase.from('planned_activities').update(updates).eq('id', id);
    await loadActivities();
  }

  async function deleteActivity(id: string) {
    await supabase.from('planned_activities').delete().eq('id', id);
    await loadActivities();
  }

  // ============================================
  // BADGES
  // ============================================
  async function loadBadges() {
    if (!user) return;
    const { data } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });
    if (data) setBadges(data as UserBadge[]);
  }

  async function checkBadges(): Promise<string[]> {
    if (!user || !profile) return [];
    const lang = getLanguage() as 'fr' | 'en';
    const earned: string[] = [];
    const existingIds = new Set(badges.map(b => b.badge_id));

    const checks: Array<{ id: string; condition: boolean }> = [
      { id: 'first_habit', condition: habits.length >= 1 },
      { id: 'habits_5', condition: habits.length >= 5 },
      { id: 'habits_10', condition: habits.length >= 10 },
      { id: 'streak_3', condition: (profile.streak_days || 0) >= 3 },
      { id: 'streak_7', condition: (profile.streak_days || 0) >= 7 },
      { id: 'streak_30', condition: (profile.streak_days || 0) >= 30 },
      { id: 'xp_500', condition: (profile.xp || 0) >= 500 },
      { id: 'xp_1000', condition: (profile.xp || 0) >= 1000 },
      { id: 'early_bird', condition: new Date().getHours() < 7 },
      { id: 'night_owl', condition: new Date().getHours() >= 22 },
    ];

    for (const check of checks) {
      if (check.condition && !existingIds.has(check.id)) {
        const badgeDef = BADGES.find(b => b.id === check.id);
        if (badgeDef) {
          await supabase.from('user_badges').insert({
            user_id: user.id,
            badge_id: check.id,
            badge_name: badgeDef.name[lang],
            badge_emoji: badgeDef.emoji,
            badge_description: badgeDef.desc[lang],
          });
          earned.push(check.id);
          triggerCelebration(`${badgeDef.emoji} ${badgeDef.name[lang]}`);
        }
      }
    }

    // Secret badge checks
    const hour = new Date().getHours();
    const secretChecks: Array<{ id: string; condition: boolean }> = [
      { id: 'secret_noctambule', condition: hour >= 0 && hour < 5 },
      // secret_leve_tot, secret_speed_runner, secret_perfectionniste, secret_discret
      // require historical data checks — simplified: check streak-based conditions
      { id: 'secret_perfectionniste', condition: (profile.streak_days || 0) >= 30 },
    ];

    for (const check of secretChecks) {
      if (check.condition && !existingIds.has(check.id)) {
        const badgeDef = SECRET_BADGES.find(b => b.id === check.id);
        if (badgeDef) {
          await supabase.from('user_badges').insert({
            user_id: user.id,
            badge_id: check.id,
            badge_name: badgeDef.name[lang],
            badge_emoji: badgeDef.emoji,
            badge_description: badgeDef.desc[lang],
          });
          earned.push(check.id);
          triggerCelebration(`🤫 ${lang === 'fr' ? 'Badge secret' : 'Secret badge'}: ${badgeDef.name[lang]}`);
        }
      }
    }

    if (earned.length > 0) await loadBadges();
    return earned;
  }

  // ============================================
  // MISSIONS
  // ============================================
  function refreshMissions() {
    refreshMissionsWithData(todayCompletions.length);
  }

  function refreshMissionsWithData(completedCount: number) {
    setDailyMissions([
      { id: 'complete_3', title: 'mission.complete_3', completed: completedCount >= 3, target: 3, current: Math.min(completedCount, 3) },
      { id: 'morning_routine', title: 'mission.morning_routine', completed: new Date().getHours() < 9 && completedCount > 0, target: 1, current: new Date().getHours() < 9 && completedCount > 0 ? 1 : 0 },
      { id: 'streak_keeper', title: 'mission.streak_keeper', completed: completedCount > 0, target: 1, current: completedCount > 0 ? 1 : 0 },
      { id: 'plan_tomorrow', title: 'mission.plan_tomorrow', completed: false, target: 1, current: 0 },
    ]);
  }

  // ============================================
  // STATS
  // ============================================
  async function loadDailyStats(days: number = 7) {
    if (!user) return [];
    const fromDate = format(new Date(Date.now() - days * 86400000), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', fromDate)
      .order('date');
    return data || [];
  }

  // ============================================
  // GDPR
  // ============================================
  async function acceptGDPR() {
    await AsyncStorage.setItem('orbit_gdpr', 'true');
    setGdprAccepted(true);
  }

  // ============================================
  // ONBOARDING
  // ============================================
  async function completeOnboarding(objectives: string[]) {
    if (!profile) return;
    await updateProfile({ onboarding_completed: true, objectives });
    setOnboardingDone(true);
  }

  // ============================================
  // CELEBRATION
  // ============================================
  function triggerCelebration(message: string) {
    setCelebrationMessage(message);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  }

  function dismissCelebration() {
    setShowCelebration(false);
  }

  return (
    <AppContext.Provider value={{
      session, user, profile, loading,
      signIn, signUp, signOut,
      theme, themeMode, accentColor, setThemeMode, setAccentColor,
      language, changeLanguage,
      userTimezone,
      updateProfile, deleteAccount,
      habits, loadHabits, createHabit, updateHabit, deleteHabit, toggleHabitCompletion,
      todayCompletions, loadCompletions,
      activities, loadActivities, createActivity, updateActivity, deleteActivity,
      badges, dailyMissions, loadBadges, refreshMissions,
      loadDailyStats,
      gdprAccepted, acceptGDPR,
      onboardingDone, completeOnboarding,
      showCelebration, celebrationMessage, dismissCelebration,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
