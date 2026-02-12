import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { getLevelForXP } from '../constants/theme';
import { t } from '../i18n';

export default function XPBar() {
  const { profile, theme } = useApp();
  const xp = profile?.xp || 0;
  const levelInfo = getLevelForXP(xp);
  const progress = levelInfo.xpForNext > 0 ? levelInfo.xpProgress / levelInfo.xpForNext : 1;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.level, { color: theme.accent }]}>
          {t(levelInfo.name)}
        </Text>
        <Text style={[styles.xp, { color: theme.textSecondary }]}>
          {xp} XP
        </Text>
      </View>
      <View style={[styles.barBg, { backgroundColor: theme.surfaceLight }]}>
        <View
          style={[styles.barFill, { backgroundColor: theme.accent, width: `${Math.min(progress * 100, 100)}%` }]}
        />
      </View>
      {levelInfo.nextLevel && (
        <Text style={[styles.next, { color: theme.textMuted }]}>
          {levelInfo.xpProgress}/{levelInfo.xpForNext} → {t(levelInfo.nextLevel.name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  level: {
    fontSize: 15,
    fontWeight: '700',
  },
  xp: {
    fontSize: 14,
    fontWeight: '600',
  },
  barBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  next: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});
