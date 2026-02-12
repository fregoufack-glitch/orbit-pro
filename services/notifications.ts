import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { toLocalDate, detectTimezone } from './timezone';

/**
 * Configure notification handler. Call once at app start.
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Request notification permissions from the user.
 */
export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Orbit Pro',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00D9A5',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('habits', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200],
      lightColor: '#00D9A5',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('activities', {
      name: 'Activity Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200],
      lightColor: '#60A5FA',
      sound: 'default',
    });
  }

  return true;
}

/**
 * Schedule a notification for a specific activity.
 */
export async function scheduleActivityNotification(
  activityId: string,
  name: string,
  emoji: string,
  date: string,
  time: string,
  timezone?: string,
): Promise<string | null> {
  const tz = timezone || detectTimezone();
  const triggerDate = toLocalDate(date, time, tz);

  if (triggerDate.getTime() <= Date.now()) {
    return null;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(`activity_${activityId}`);
  } catch { /* may not exist */ }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${emoji} ${name}`,
      body: `It's time for "${name}"`,
      data: { type: 'activity', activityId },
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: 'activities' } : {}),
    },
    trigger: { date: triggerDate } as any,
    identifier: `activity_${activityId}`,
  });

  return id;
}

/**
 * Schedule a daily habit reminder.
 */
export async function scheduleHabitReminder(
  habitId: string,
  name: string,
  emoji: string,
  time: string,
  _timezone?: string,
): Promise<string | null> {
  const [hours, minutes] = time.split(':').map(Number);

  try {
    await Notifications.cancelScheduledNotificationAsync(`habit_${habitId}`);
  } catch { /* may not exist */ }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${emoji} ${name}`,
      body: `Time to work on "${name}"! Keep your streak going! 🔥`,
      data: { type: 'habit', habitId },
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: 'habits' } : {}),
    },
    trigger: { hour: hours, minute: minutes, repeats: true } as any,
    identifier: `habit_${habitId}`,
  });

  return id;
}

/**
 * Schedule a daily motivation reminder.
 */
export async function scheduleDailyReminder(
  time: string,
  pseudo: string,
  language: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync('daily_reminder');
  } catch { /* may not exist */ }

  const [hours, minutes] = time.split(':').map(Number);
  const title = language === 'fr' ? `Hey ${pseudo} ! 👋` : `Hey ${pseudo}! 👋`;
  const body = language === 'fr'
    ? "N'oubliez pas vos habitudes aujourd'hui !"
    : "Don't forget your habits today!";

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: { hour: hours, minute: minutes, repeats: true } as any,
    identifier: 'daily_reminder',
  });
}

/**
 * Cancel all scheduled notifications and reschedule everything.
 */
export async function rescheduleAllNotifications(params: {
  habits: Array<{ id: string; name: string; emoji: string; target_time: string | null; reminder_enabled: boolean }>;
  activities: Array<{ id: string; name: string; emoji: string; date: string; start_time: string }>;
  notificationEnabled: boolean;
  notificationTime: string;
  pseudo: string;
  language: string;
  timezone?: string;
}): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!params.notificationEnabled) return;

  // Schedule habit reminders
  for (const habit of params.habits) {
    if (habit.reminder_enabled && habit.target_time) {
      await scheduleHabitReminder(habit.id, habit.name, habit.emoji, habit.target_time, params.timezone);
    }
  }

  // Schedule activity notifications
  for (const activity of params.activities) {
    await scheduleActivityNotification(
      activity.id, activity.name, activity.emoji, activity.date, activity.start_time, params.timezone,
    );
  }

  // Schedule daily motivation reminder
  await scheduleDailyReminder(params.notificationTime, params.pseudo, params.language);
}

/**
 * Check if we're in quiet hours. If so, skip notification.
 */
export function isInQuietHours(
  quietStart: string,
  quietEnd: string,
  timezone?: string,
): boolean {
  const tz = timezone || detectTimezone();
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const currentHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const currentMin = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const currentMins = currentHour * 60 + currentMin;

  const [startH, startM] = quietStart.split(':').map(Number);
  const [endH, endM] = quietEnd.split(':').map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;

  if (startMins <= endMins) {
    return currentMins >= startMins && currentMins < endMins;
  }
  // Wraps midnight (e.g. 23:00 - 07:00)
  return currentMins >= startMins || currentMins < endMins;
}

/**
 * Schedule a smart reminder for a missed habit (3 consecutive days).
 * Suggests adjusting the habit instead of nagging.
 */
export async function scheduleMissedHabitReminder(
  habitId: string,
  habitName: string,
  habitEmoji: string,
  language: string,
): Promise<void> {
  const title = language === 'fr'
    ? `${habitEmoji} Ajuster ${habitName} ?`
    : `${habitEmoji} Adjust ${habitName}?`;
  const body = language === 'fr'
    ? `Tu n'as pas fait ${habitName} depuis 3 jours. Veux-tu ajuster l'horaire ?`
    : `You haven't done ${habitName} in 3 days. Want to adjust the schedule?`;

  try {
    await Notifications.cancelScheduledNotificationAsync(`missed_${habitId}`);
  } catch { /* may not exist */ }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'missed_habit', habitId },
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: 'habits' } : {}),
    },
    trigger: null, // Send immediately
    identifier: `missed_${habitId}`,
  });
}

/**
 * Check habits for 3+ consecutive missed days and send smart reminders.
 * Call this periodically (e.g., in background sync or on app open).
 */
export async function checkMissedHabits(
  habits: Array<{ id: string; name: string; emoji: string }>,
  completions: Array<{ habit_id: string; completed_date: string }>,
  language: string,
): Promise<void> {
  const today = new Date();
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);

  for (const habit of habits) {
    const recentCompletions = completions.filter(c => {
      if (c.habit_id !== habit.id) return false;
      const d = new Date(c.completed_date);
      return d >= threeDaysAgo && d <= today;
    });

    if (recentCompletions.length === 0) {
      await scheduleMissedHabitReminder(habit.id, habit.name, habit.emoji, language);
    }
  }
}

/**
 * Get count of pending notifications.
 */
export async function getPendingNotificationCount(): Promise<number> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications.length;
}

/**
 * Check if current time is within quiet hours.
 */
export function isQuietHours(startHour: string = '23:00', endHour: string = '07:00'): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = startHour.split(':').map(Number);
  const [endH, endM] = endHour.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes > endMinutes) {
    // Crosses midnight (e.g. 23:00 → 07:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Define a background task for handling notifications (required for expo-task-manager).
 */
export function defineNotificationBackgroundTask(): void {
  try {
    const TaskManager = require('expo-task-manager');
    const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

    TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error }: any) => {
      if (error) {
        console.log('[notification-bg] Error:', error);
        return;
      }
      console.log('[notification-bg] Received background notification:', data);
    });
  } catch (e) {
    console.log('[notification-bg] Task definition skipped:', (e as Error).message);
  }
}
