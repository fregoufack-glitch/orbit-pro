import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ============================================
// Google AdMob Service — 100% Free to integrate
// ============================================

// Test Ad Unit IDs (Google-provided, always free)
const TEST_IDS = {
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }),
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
};

// Use env vars for production, fall back to test IDs
const AD_UNITS = {
  rewarded: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID || TEST_IDS.rewarded!,
  interstitial: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || TEST_IDS.interstitial!,
  banner: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || TEST_IDS.banner!,
};

// Daily limits
const MAX_REWARDED_PER_DAY = 5;
const MAX_INTERSTITIAL_PER_DAY = 3;
const STORAGE_KEY = '@orbit_ad_state';

export interface AdState {
  date: string;
  rewardedCount: number;
  interstitialCount: number;
  xpEarnedFromAds: number;
  habitCompletionsSinceLastInterstitial: number;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

async function loadAdState(): Promise<AdState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state: AdState = JSON.parse(raw);
      if (state.date === todayStr()) return state;
    }
  } catch {}
  return {
    date: todayStr(),
    rewardedCount: 0,
    interstitialCount: 0,
    xpEarnedFromAds: 0,
    habitCompletionsSinceLastInterstitial: 0,
  };
}

async function saveAdState(state: AdState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function getAdState(): Promise<AdState> {
  return loadAdState();
}

export function canShowRewarded(state: AdState): boolean {
  return state.rewardedCount < MAX_REWARDED_PER_DAY;
}

export function canShowInterstitial(state: AdState): boolean {
  return (
    state.interstitialCount < MAX_INTERSTITIAL_PER_DAY &&
    state.habitCompletionsSinceLastInterstitial >= 10
  );
}

export function getRewardedAdUnitId(): string {
  return AD_UNITS.rewarded;
}

export function getInterstitialAdUnitId(): string {
  return AD_UNITS.interstitial;
}

export function getBannerAdUnitId(): string {
  return AD_UNITS.banner;
}

export async function recordRewardedView(xpEarned: number): Promise<AdState> {
  const state = await loadAdState();
  state.rewardedCount += 1;
  state.xpEarnedFromAds += xpEarned;
  await saveAdState(state);
  return state;
}

export async function recordInterstitialView(): Promise<AdState> {
  const state = await loadAdState();
  state.interstitialCount += 1;
  state.habitCompletionsSinceLastInterstitial = 0;
  await saveAdState(state);
  return state;
}

export async function recordHabitCompletion(): Promise<AdState> {
  const state = await loadAdState();
  state.habitCompletionsSinceLastInterstitial += 1;
  await saveAdState(state);
  return state;
}

export function getRemainingRewarded(state: AdState): number {
  return Math.max(0, MAX_REWARDED_PER_DAY - state.rewardedCount);
}

export function getRemainingInterstitial(state: AdState): number {
  return Math.max(0, MAX_INTERSTITIAL_PER_DAY - state.interstitialCount);
}

export default {
  getAdState,
  canShowRewarded,
  canShowInterstitial,
  getRewardedAdUnitId,
  getInterstitialAdUnitId,
  getBannerAdUnitId,
  recordRewardedView,
  recordInterstitialView,
  recordHabitCompletion,
  getRemainingRewarded,
  getRemainingInterstitial,
};
