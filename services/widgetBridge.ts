import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Widget data shape shared between JS and native widget.
 */
export interface WidgetData {
  progress: number;       // 0-100
  completed: number;
  total: number;
  streak: number;
  xp: number;
  level: number;
  nextHabit: {
    name: string;
    emoji: string;
    time: string | null;
  } | null;
  updatedAt: string;
}

/**
 * Update the native home screen widget with fresh data.
 *
 * On Android: Uses react-native-android-widget's requestWidgetUpdate.
 * On iOS: Uses AsyncStorage + WidgetKit (requires native module or expo-widgets).
 *
 * Both platforms read from AsyncStorage as a shared data bridge.
 */
export async function updateWidget(data: WidgetData): Promise<void> {
  // Always persist to AsyncStorage (shared data source)
  await AsyncStorage.setItem('orbit_widget_data', JSON.stringify(data));

  if (Platform.OS === 'android') {
    try {
      // react-native-android-widget provides requestWidgetUpdate
      const { requestWidgetUpdate } = require('react-native-android-widget');
      const { OrbitWidget } = require('../widgets/OrbitWidget');
      await requestWidgetUpdate({
        widgetName: 'OrbitWidget',
        renderWidget: () => OrbitWidget(data),
        widgetNotFound: () => {
          console.log('[widget] No widget placed on home screen yet');
        },
      });
      console.log('[widget] Android widget updated');
    } catch (e) {
      console.log('[widget] Android widget update skipped (not installed or not supported):', (e as Error).message);
    }
  } else if (Platform.OS === 'ios') {
    try {
      // For iOS, WidgetKit reloads are triggered via the native module.
      // expo-widgets or a custom native module would call WidgetCenter.shared.reloadAllTimelines()
      // The Swift widget reads from the shared App Group container.
      // For now, we persist to AsyncStorage which can be read via App Groups.
      console.log('[widget] iOS widget data saved to AsyncStorage');
    } catch (e) {
      console.log('[widget] iOS widget update skipped:', (e as Error).message);
    }
  }
}

/**
 * Read the last saved widget data.
 */
export async function getWidgetData(): Promise<WidgetData | null> {
  try {
    const raw = await AsyncStorage.getItem('orbit_widget_data');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
