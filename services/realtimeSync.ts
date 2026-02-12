import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

let channels: RealtimeChannel[] = [];

export type RealtimeEvent = {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
};

export type RealtimeCallback = (event: RealtimeEvent) => void;

/**
 * Start realtime subscriptions for a user.
 * Listens to all user-related tables.
 */
export function startRealtimeSync(userId: string, callback: RealtimeCallback): void {
  stopRealtimeSync();

  const tables = [
    { name: 'habits', filter: `user_id=eq.${userId}` },
    { name: 'habit_completions', filter: `user_id=eq.${userId}` },
    { name: 'planned_activities', filter: `user_id=eq.${userId}` },
    { name: 'user_badges', filter: `user_id=eq.${userId}` },
    { name: 'daily_stats', filter: `user_id=eq.${userId}` },
    { name: 'messages', filter: `receiver_id=eq.${userId}` },
    { name: 'friendships', filter: `addressee_id=eq.${userId}` },
  ];

  for (const table of tables) {
    const channel = supabase
      .channel(`realtime_${table.name}_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table.name,
        filter: table.filter,
      }, (payload) => {
        callback({
          table: table.name,
          eventType: payload.eventType as any,
          new: payload.new,
          old: payload.old,
        });
      })
      .subscribe();

    channels.push(channel);
  }
}

/**
 * Stop all realtime subscriptions.
 */
export function stopRealtimeSync(): void {
  for (const channel of channels) {
    supabase.removeChannel(channel);
  }
  channels = [];
}

/**
 * Determine which data collections are affected by a realtime event.
 */
export function getAffectedCollections(event: RealtimeEvent): string[] {
  const map: Record<string, string[]> = {
    habits: ['habits'],
    habit_completions: ['completions', 'missions', 'stats'],
    planned_activities: ['activities'],
    user_badges: ['badges'],
    daily_stats: ['stats'],
    messages: ['messages', 'conversations'],
    friendships: ['friends'],
  };
  return map[event.table] || [];
}

/**
 * Perform a full data sync for the user.
 * Called on app foreground or after extended background.
 */
export async function fullSync(userId: string): Promise<{
  habits: any[];
  completions: any[];
  activities: any[];
  badges: any[];
  profile: any;
}> {
  const today = new Date().toISOString().split('T')[0];

  const [habitsRes, completionsRes, activitiesRes, badgesRes, profileRes] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', userId).eq('is_active', true).order('sort_order'),
    supabase.from('habit_completions').select('*').eq('user_id', userId).eq('completed_date', today),
    supabase.from('planned_activities').select('*').eq('user_id', userId).order('start_time'),
    supabase.from('user_badges').select('*').eq('user_id', userId).order('earned_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', userId).single(),
  ]);

  return {
    habits: habitsRes.data || [],
    completions: completionsRes.data || [],
    activities: activitiesRes.data || [],
    badges: badgesRes.data || [],
    profile: profileRes.data,
  };
}
