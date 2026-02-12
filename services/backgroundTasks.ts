import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { supabase } from '../lib/supabase';

const BACKGROUND_SYNC_TASK = 'orbit-pro-background-sync';

/**
 * Define the background sync task.
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const userId = session.user.id;
    const today = new Date().toISOString().split('T')[0];

    const { data: completions } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('completed_date', today);

    const { data: habits } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    const habitsCompleted = completions?.length || 0;
    const habitsTotal = habits?.length || 0;

    await supabase.from('daily_stats').upsert({
      user_id: userId,
      date: today,
      habits_completed: habitsCompleted,
      habits_total: habitsTotal,
      perfect_day: habitsTotal > 0 && habitsCompleted >= habitsTotal,
    }, { onConflict: 'user_id,date' });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[backgroundTasks] Sync failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register the background sync task.
 */
export async function registerBackgroundSync(): Promise<boolean> {
  try {
    const status = await BackgroundFetch.getStatusAsync();

    if (status === BackgroundFetch.BackgroundFetchStatus.Denied ||
        status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
      console.warn('[backgroundTasks] Background fetch not available');
      return false;
    }

    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('[backgroundTasks] Background sync registered');
    return true;
  } catch (error) {
    console.error('[backgroundTasks] Failed to register:', error);
    return false;
  }
}

/**
 * Unregister the background sync task.
 */
export async function unregisterBackgroundSync(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    }
  } catch (error) {
    console.error('[backgroundTasks] Failed to unregister:', error);
  }
}

/**
 * Trigger a foreground sync. Same logic as background but run immediately.
 */
export async function triggerForegroundSync(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const userId = session.user.id;
    const today = new Date().toISOString().split('T')[0];

    const [completionsRes, habitsRes] = await Promise.all([
      supabase.from('habit_completions').select('id').eq('user_id', userId).eq('completed_date', today),
      supabase.from('habits').select('id').eq('user_id', userId).eq('is_active', true),
    ]);

    const habitsCompleted = completionsRes.data?.length || 0;
    const habitsTotal = habitsRes.data?.length || 0;

    await supabase.from('daily_stats').upsert({
      user_id: userId,
      date: today,
      habits_completed: habitsCompleted,
      habits_total: habitsTotal,
      perfect_day: habitsTotal > 0 && habitsCompleted >= habitsTotal,
    }, { onConflict: 'user_id,date' });
  } catch (error) {
    console.error('[backgroundTasks] Foreground sync failed:', error);
  }
}

/**
 * Check if background sync is registered.
 */
export async function isBackgroundSyncRegistered(): Promise<boolean> {
  try {
    return await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  } catch {
    return false;
  }
}
