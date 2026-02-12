import { Platform } from 'react-native';

// ============================================
// Expo OTA Updates — 100% Free
// Silent background check + download, user chooses when to restart
// ============================================

let updateReady = false;

export function isUpdateReady(): boolean {
  return updateReady;
}

export async function checkForUpdates(): Promise<{ isAvailable: boolean }> {
  // OTA updates only work in production builds, not in Expo Go / dev
  if (__DEV__) return { isAvailable: false };

  try {
    const Updates = require('expo-updates');
    if (!Updates.isEnabled) return { isAvailable: false };

    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) return { isAvailable: false };

    // Download in background
    await Updates.fetchUpdateAsync();
    updateReady = true;
    return { isAvailable: true };
  } catch (e) {
    console.log('[updates] Check failed:', (e as Error).message);
    return { isAvailable: false };
  }
}

export async function applyUpdate(): Promise<boolean> {
  try {
    const Updates = require('expo-updates');
    await Updates.reloadAsync();
    return true;
  } catch (e) {
    console.log('[updates] Apply failed:', (e as Error).message);
    return false;
  }
}

export default { checkForUpdates, applyUpdate, isUpdateReady };
