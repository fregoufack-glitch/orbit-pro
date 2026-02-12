import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import StreakFlame from '../../components/StreakFlame';
import XPBar from '../../components/XPBar';
import ProfileAvatarButton from '../../components/ProfileAvatarButton';
import RewardedAdButton from '../../components/RewardedAdButton';
import { format } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const {
    profile, theme, habits, todayCompletions, dailyMissions,
    toggleHabitCompletion, loadHabits, loadActivities,
    activities, refreshMissions,
  } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('home.greeting_morning') : hour < 18 ? t('home.greeting_afternoon') : t('home.greeting_evening');

  const completedCount = todayCompletions.length;
  const totalHabits = habits.filter(h => h.is_active).length;
  const progress = totalHabits > 0 ? completedCount / totalHabits : 0;

  useEffect(() => {
    loadHabits();
    loadActivities(today);
    refreshMissions();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadHabits();
    await loadActivities(today);
    refreshMissions();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting},</Text>
          <Text style={[styles.name, { color: theme.text }]}>{profile?.pseudo || 'User'} 👋</Text>
        </View>
        <View style={styles.headerRight}>
          <StreakFlame size="small" />
          <ProfileAvatarButton size={44} />
        </View>
      </View>

      {/* XP Bar */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <XPBar />
      </View>

      {/* Rewarded Ad XP Button */}
      <View style={{ marginHorizontal: 16, marginTop: 12 }}>
        <RewardedAdButton
          xpAmount={50}
          type="xp_bonus"
          onReward={(xp) => {
            if (profile) {
              // XP update handled by the ad service
            }
          }}
        />
      </View>

      {/* Day Progress */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>{t('home.today_progress')}</Text>
          <Text style={[styles.progressText, { color: theme.accent }]}>
            {completedCount}/{totalHabits}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.surfaceLight }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${progress * 100}%` }]} />
        </View>
        {progress >= 1 && (
          <Text style={[styles.perfectDay, { color: theme.accent }]}>⭐ {t('home.perfect_day')}</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t('home.quick_actions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: theme.accent + '20' }]}
            onPress={() => router.push('/habits/create')}
          >
            <Text style={styles.quickEmoji}>➕</Text>
            <Text style={[styles.quickText, { color: theme.accent }]}>{t('habits.add')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#A78BFA20' }]}
            onPress={() => router.push('/planner/create')}
          >
            <Text style={styles.quickEmoji}>📅</Text>
            <Text style={[styles.quickText, { color: '#A78BFA' }]}>{t('planner.add_activity')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#FF6B6B20' }]}
            onPress={() => router.push('/focus')}
          >
            <Text style={styles.quickEmoji}>🎯</Text>
            <Text style={[styles.quickText, { color: '#FF6B6B' }]}>{t('focus.title')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Habits Timeline */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t('home.timeline')}</Text>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌟</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('home.no_habits')}</Text>
            <TouchableOpacity onPress={() => router.push('/habits/create')}>
              <Text style={[styles.emptyAction, { color: theme.accent }]}>{t('home.add_first')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          habits.map((habit, index) => {
            const isCompleted = todayCompletions.some(c => c.habit_id === habit.id);
            return (
              <TouchableOpacity
                key={habit.id}
                style={[styles.timelineItem, { borderLeftColor: isCompleted ? theme.accent : theme.border }]}
                onPress={() => toggleHabitCompletion(habit.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.timelineDot, { backgroundColor: isCompleted ? theme.accent : theme.surfaceLight }]}>
                  <Text style={styles.timelineEmoji}>{isCompleted ? '✅' : habit.emoji}</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineName, { color: isCompleted ? theme.accent : theme.text, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>
                    {habit.name}
                  </Text>
                  {habit.target_time && (
                    <Text style={[styles.timelineTime, { color: theme.textMuted }]}>{habit.target_time}</Text>
                  )}
                </View>
                {isCompleted && <Text style={styles.xpBadge}>+10 XP</Text>}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Daily Missions */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>🎯 {t('home.daily_missions')}</Text>
        {dailyMissions.map(mission => (
          <View key={mission.id} style={[styles.missionItem, { borderColor: mission.completed ? theme.accent : theme.border }]}>
            <Text style={styles.missionCheck}>{mission.completed ? '✅' : '⬜'}</Text>
            <View style={styles.missionContent}>
              <Text style={[styles.missionTitle, { color: mission.completed ? theme.accent : theme.text }]}>
                {t(mission.title)}
              </Text>
              <View style={[styles.missionBar, { backgroundColor: theme.surfaceLight }]}>
                <View style={[styles.missionBarFill, { backgroundColor: theme.accent, width: `${(mission.current / mission.target) * 100}%` }]} />
              </View>
            </View>
            <Text style={[styles.missionCount, { color: theme.textMuted }]}>
              {mission.current}/{mission.target}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  headerLeft: {},
  headerRight: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  greeting: { fontSize: 16 },
  name: { fontSize: 26, fontWeight: '900' },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressText: { fontSize: 16, fontWeight: '700' },
  progressBar: { height: 12, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  perfectDay: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  quickActions: { flexDirection: 'row', gap: 10 },
  quickAction: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 6,
  },
  quickEmoji: { fontSize: 24 },
  quickText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 16, marginBottom: 8 },
  emptyAction: { fontSize: 16, fontWeight: '700' },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    borderLeftWidth: 3,
    marginLeft: 8,
    gap: 12,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineEmoji: { fontSize: 20 },
  timelineContent: { flex: 1 },
  timelineName: { fontSize: 16, fontWeight: '600' },
  timelineTime: { fontSize: 13, marginTop: 2 },
  xpBadge: { fontSize: 12, fontWeight: '700', color: '#00D9A5', backgroundColor: '#00D9A520', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  missionCheck: { fontSize: 20 },
  missionContent: { flex: 1 },
  missionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  missionBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  missionBarFill: { height: '100%', borderRadius: 3 },
  missionCount: { fontSize: 13, fontWeight: '600' },
});
