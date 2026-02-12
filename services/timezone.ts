import * as Localization from 'expo-localization';
import { supabase } from '../lib/supabase';

/**
 * Detect the user's timezone from the device and return it.
 */
export function detectTimezone(): string {
  try {
    // expo-localization exposes the IANA timezone
    const tz = Localization.timezone; // e.g. "America/New_York"
    return tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }
}

/**
 * Silently update the user's timezone in their Supabase profile.
 * Called on every app open and on login/signup.
 */
export async function syncTimezone(userId: string): Promise<string> {
  const tz = detectTimezone();

  const { error } = await supabase
    .from('profiles')
    .update({ timezone: tz })
    .eq('id', userId);

  if (error) {
    console.warn('[timezone] Failed to sync timezone:', error.message);
  } else {
    console.log('[timezone] Synced timezone:', tz);
  }

  return tz;
}

/**
 * Convert a date string + time string (HH:mm) from user's timezone to a Date object.
 * Useful for scheduling notifications in the correct local time.
 */
export function toLocalDate(dateStr: string, timeStr: string, timezone?: string): Date {
  const tz = timezone || detectTimezone();
  // Build an ISO-like string and parse it in the user's timezone
  const isoStr = `${dateStr}T${timeStr}:00`;

  try {
    // Create formatter in the target timezone to figure out the offset
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // We want to create a Date that, when displayed in the user's timezone, shows dateStr @ timeStr.
    // Strategy: parse naively, then adjust by the offset difference.
    const naive = new Date(isoStr);

    // Get what the naive date looks like in the target timezone
    const parts = formatter.formatToParts(naive);
    const get = (type: string) => parts.find(p => p.type === type)?.value || '0';

    const tzYear = parseInt(get('year'));
    const tzMonth = parseInt(get('month'));
    const tzDay = parseInt(get('day'));
    const tzHour = parseInt(get('hour'));
    const tzMinute = parseInt(get('minute'));

    // Calculate the offset: naive UTC components vs what tz shows
    const naiveMinutes = naive.getUTCHours() * 60 + naive.getUTCMinutes();
    const tzMinutes = tzHour * 60 + tzMinute;

    // Day difference handling (simplified — works for ±12h offsets)
    let dayDiff = naive.getUTCDate() - tzDay;
    if (dayDiff > 15) dayDiff -= 30; // month wrap
    if (dayDiff < -15) dayDiff += 30;

    const offsetMinutes = naiveMinutes - tzMinutes + dayDiff * 1440;

    // The actual UTC time we want: the desired local time + offset
    const [h, m] = timeStr.split(':').map(Number);
    const [y, mo, d] = dateStr.split('-').map(Number);
    const desired = new Date(Date.UTC(y, mo - 1, d, h, m, 0, 0));
    desired.setUTCMinutes(desired.getUTCMinutes() + offsetMinutes);

    return desired;
  } catch {
    // Fallback: treat as UTC
    return new Date(`${dateStr}T${timeStr}:00Z`);
  }
}

/**
 * Get current time in the user's timezone as a formatted string.
 */
export function nowInTimezone(timezone?: string): { hours: number; minutes: number; dateStr: string } {
  const tz = timezone || detectTimezone();
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value || '0';

  return {
    hours: parseInt(get('hour')),
    minutes: parseInt(get('minute')),
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

/**
 * Get today's date string in the user's timezone (YYYY-MM-DD).
 */
export function todayInTimezone(timezone?: string): string {
  return nowInTimezone(timezone).dateStr;
}
