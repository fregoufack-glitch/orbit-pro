import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';

export default function AICoachButton() {
  const router = useRouter();
  const { theme } = useApp();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulse }] }]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
        onPress={() => router.push('/ai-coach')}
        activeOpacity={0.8}
      >
        <Animated.Text style={styles.emoji}>🤖</Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 100,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  emoji: {
    fontSize: 28,
  },
});
