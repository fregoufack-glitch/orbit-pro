import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useApp } from '../contexts/AppContext';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = ['#00D9A5', '#FF6B6B', '#FFE66D', '#A78BFA', '#F472B6', '#60A5FA', '#FB923C', '#4ECDC4'];

function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(Math.random() * width)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height + 50,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 10,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 10],
    outputRange: ['0deg', '3600deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          backgroundColor: color,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
          opacity,
          width: 8 + Math.random() * 8,
          height: 8 + Math.random() * 8,
          borderRadius: Math.random() > 0.5 ? 50 : 2,
        },
      ]}
    />
  );
}

export default function CelebrationOverlay() {
  const { showCelebration, celebrationMessage, dismissCelebration, theme } = useApp();
  const scale = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showCelebration) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
        Animated.timing(messageOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scale, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(messageOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => dismissCelebration());
      }, 2700);
    } else {
      scale.setValue(0);
      messageOpacity.setValue(0);
    }
  }, [showCelebration]);

  if (!showCelebration) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: 40 }).map((_, i) => (
        <ConfettiPiece
          key={i}
          delay={i * 50}
          color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
        />
      ))}
      <Animated.View style={[styles.messageBox, { transform: [{ scale }], opacity: messageOpacity }]}>
        <Text style={[styles.messageText, { color: theme.accent }]}>{celebrationMessage}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    top: -20,
  },
  messageBox: {
    position: 'absolute',
    top: height / 2 - 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(10, 14, 26, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00D9A5',
  },
  messageText: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
});
