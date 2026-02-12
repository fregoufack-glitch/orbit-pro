import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n';
import {
  getRewardedAdUnitId,
  getAdState,
  canShowRewarded,
  recordRewardedView,
  getRemainingRewarded,
  AdState,
} from '../services/ads';

interface Props {
  xpAmount: number;
  type: 'xp_bonus' | 'double_xp' | 'streak_freeze' | 'stats_unlock' | 'focus_bonus';
  label?: string;
  emoji?: string;
  onReward?: (xp: number) => void;
}

const rewarded = RewardedAd.createForAdRequest(getRewardedAdUnitId(), {
  requestNonPersonalizedAdsOnly: true,
});

export default function RewardedAdButton({ xpAmount, type, label, emoji, onReward }: Props) {
  const { theme, profile, updateProfile } = useApp();
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adState, setAdState] = useState<AdState | null>(null);
  const [rewardPending, setRewardPending] = useState(false);

  useEffect(() => {
    getAdState().then(setAdState);
  }, []);

  useEffect(() => {
    const unsubLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
      setLoading(false);
    });

    const unsubEarned = rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      setRewardPending(true);
    });

    const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      if (rewardPending) {
        handleRewardEarned();
        setRewardPending(false);
      }
      setLoaded(false);
      // Preload next ad
      rewarded.load();
    });

    const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
      setLoading(false);
      setLoaded(false);
    });

    // Initial load
    rewarded.load();

    return () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
    };
  }, []);

  const handleRewardEarned = useCallback(async () => {
    if (!profile) return;

    if (type === 'streak_freeze') {
      const freezes = (profile as any).streak_freezes_available || 0;
      await updateProfile({ streak_freezes_available: freezes + 1 } as any);
    } else {
      const newXP = (profile.xp || 0) + xpAmount;
      await updateProfile({ xp: newXP });
    }

    const newState = await recordRewardedView(xpAmount);
    setAdState(newState);
    onReward?.(xpAmount);
  }, [profile, xpAmount, type, onReward, updateProfile]);

  const handlePress = useCallback(() => {
    if (loaded) {
      rewarded.show();
    } else {
      setLoading(true);
      rewarded.load();
    }
  }, [loaded]);

  const limitReached = adState ? !canShowRewarded(adState) : false;
  const remaining = adState ? getRemainingRewarded(adState) : MAX_REWARDED;

  const buttonEmoji = emoji || '🎬';
  const buttonLabel = limitReached
    ? t('ads.dailyAdLimitReached')
    : label || t('ads.watchAdForXP').replace('{xp}', String(xpAmount));

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: limitReached ? theme.surface : theme.accent + '20',
          borderColor: limitReached ? theme.textSecondary + '40' : theme.accent,
          opacity: limitReached ? 0.5 : 1,
        },
      ]}
      onPress={handlePress}
      disabled={limitReached || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.accent} />
      ) : (
        <>
          <Text style={styles.emoji}>{buttonEmoji}</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: limitReached ? theme.textSecondary : theme.accent }]}>
              {buttonLabel}
            </Text>
            {!limitReached && adState && (
              <Text style={[styles.remaining, { color: theme.textSecondary }]}>
                {remaining}/{MAX_REWARDED} {t('ads.remainingToday')}
              </Text>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const MAX_REWARDED = 5;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  remaining: {
    fontSize: 12,
    marginTop: 2,
  },
});
