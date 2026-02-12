import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { session, loading, onboardingDone, gdprAccepted } = useApp();
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const planet1Rotate = useRef(new Animated.Value(0)).current;
  const planet2Rotate = useRef(new Animated.Value(0)).current;
  const planet3Rotate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate splash
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 40, friction: 6, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
      Animated.timing(textOpacity, { toValue: 1, duration: 1000, delay: 500, useNativeDriver: true }),
    ]).start();

    // Planet rotations
    Animated.loop(
      Animated.timing(planet1Rotate, { toValue: 1, duration: 4000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(planet2Rotate, { toValue: 1, duration: 6000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(planet3Rotate, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (!session) {
        router.replace('/auth/login');
      } else if (!onboardingDone) {
        router.replace('/onboarding');
      } else {
        router.replace('/tabs');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [loading, session, onboardingDone]);

  const spin1 = planet1Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const spin2 = planet2Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });
  const spin3 = planet3Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      {/* Orbiting planets */}
      <Animated.View style={[styles.orbit, styles.orbit1, { transform: [{ rotate: spin1 }] }]}>
        <View style={[styles.planet, { backgroundColor: '#00D9A5' }]} />
      </Animated.View>
      <Animated.View style={[styles.orbit, styles.orbit2, { transform: [{ rotate: spin2 }] }]}>
        <View style={[styles.planet, styles.planet2, { backgroundColor: '#A78BFA' }]} />
      </Animated.View>
      <Animated.View style={[styles.orbit, styles.orbit3, { transform: [{ rotate: spin3 }] }]}>
        <View style={[styles.planet, styles.planet3, { backgroundColor: '#FF6B6B' }]} />
      </Animated.View>

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <Text style={styles.logoEmoji}>🪐</Text>
      </Animated.View>

      {/* Text */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <Text style={styles.title}>Orbit Pro</Text>
        <Text style={styles.subtitle}>Track • Grow • Achieve</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#00D9A5',
    shadowColor: '#00D9A5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 80,
    elevation: 20,
  },
  orbit: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  orbit1: {
    width: 200,
    height: 200,
  },
  orbit2: {
    width: 280,
    height: 280,
  },
  orbit3: {
    width: 360,
    height: 360,
  },
  planet: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  planet2: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planet3: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  logoContainer: {
    marginBottom: 20,
    zIndex: 2,
  },
  logoEmoji: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#00D9A5',
    marginTop: 8,
    letterSpacing: 4,
    fontWeight: '500',
  },
});
