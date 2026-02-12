import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n';

export default function StreakFlame({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const { profile, theme } = useApp();
  const streak = profile?.streak_days || 0;
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.15, duration: 800, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 1, duration: 800, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0.5, duration: 800, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [streak]);

  const sizes = {
    small: { flame: 24, text: 14, container: 50 },
    medium: { flame: 36, text: 18, container: 70 },
    large: { flame: 48, text: 24, container: 90 },
  };

  const s = sizes[size];

  if (streak === 0) {
    return (
      <View style={[styles.container, { width: s.container, height: s.container }]}>
        <Text style={{ fontSize: s.flame, opacity: 0.3 }}>🔥</Text>
        <Text style={[styles.count, { fontSize: s.text, color: theme.textMuted }]}>0</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: s.container, height: s.container }]}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Animated.Text style={[{ fontSize: s.flame, opacity: glow }]}>🔥</Animated.Text>
      </Animated.View>
      <Text style={[styles.count, { fontSize: s.text, color: theme.accent }]}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontWeight: '900',
    marginTop: -4,
  },
});
