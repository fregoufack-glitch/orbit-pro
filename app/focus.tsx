import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Vibration } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n';
import { supabase } from '../lib/supabase';
import RewardedAdButton from '../components/RewardedAdButton';

const WORK_DURATIONS = [10, 25, 50];
const BREAK_DURATION = 5;

type TimerPhase = 'idle' | 'work' | 'break' | 'completed';

export default function FocusScreen() {
  const router = useRouter();
  const { theme, user, profile, habits, updateProfile } = useApp();
  const [workDuration, setWorkDuration] = useState(25);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [phase, setPhase] = useState<TimerPhase>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (phase !== 'work' && phase !== 'break') return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          if (phase === 'work') {
            handleWorkComplete();
          } else {
            handleBreakComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  async function handleWorkComplete() {
    Vibration.vibrate([0, 500, 200, 500]);
    setSessionsCompleted(prev => prev + 1);

    // Save focus session to database
    if (user) {
      await supabase.from('focus_sessions').insert({
        user_id: user.id,
        habit_id: selectedHabit,
        duration_minutes: workDuration,
        completed: true,
      });
    }

    // Award XP
    if (profile) {
      const xpGain = workDuration >= 25 ? 20 : 10;
      await updateProfile({ xp: (profile.xp || 0) + xpGain });
    }

    // Start break
    setPhase('break');
    setTimeLeft(BREAK_DURATION * 60);
  }

  function handleBreakComplete() {
    Vibration.vibrate([0, 300, 150, 300]);
    setPhase('completed');
  }

  function startWork() {
    setTimeLeft(workDuration * 60);
    setPhase('work');
  }

  function startAnotherRound() {
    setTimeLeft(workDuration * 60);
    setPhase('work');
  }

  function stopTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase('idle');
    setTimeLeft(workDuration * 60);
  }

  function resetAll() {
    stopTimer();
    setSessionsCompleted(0);
    setSelectedHabit(null);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = phase === 'break' ? BREAK_DURATION * 60 : workDuration * 60;
  const progress = (phase === 'work' || phase === 'break') ? 1 - timeLeft / totalSeconds : 0;

  // Circular progress dimensions
  const size = 260;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const isWorkPhase = phase === 'work';
  const ringColor = isWorkPhase ? theme.accent : '#A78BFA';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>🎯 {t('focus.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Duration selector */}
      {phase === 'idle' && (
        <>
          <View style={styles.durationRow}>
            {WORK_DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.durationBtn, { backgroundColor: d === workDuration ? theme.accent : theme.surface }]}
                onPress={() => { setWorkDuration(d); setTimeLeft(d * 60); }}
              >
                <Text style={[styles.durationText, { color: d === workDuration ? '#0A0A0F' : theme.textSecondary }]}>
                  {d} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Habit selector */}
          {habits.length > 0 && (
            <View style={styles.habitSelector}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{t('focus.link_habit')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.habitRow}>
                  {habits.map(h => (
                    <TouchableOpacity
                      key={h.id}
                      style={[
                        styles.habitChip,
                        {
                          backgroundColor: selectedHabit === h.id ? theme.accent + '30' : theme.surface,
                          borderColor: selectedHabit === h.id ? theme.accent : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedHabit(selectedHabit === h.id ? null : h.id)}
                    >
                      <Text style={styles.habitChipEmoji}>{h.emoji}</Text>
                      <Text style={[styles.habitChipText, { color: theme.text }]} numberOfLines={1}>{h.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </>
      )}

      {/* Phase indicator */}
      {(phase === 'work' || phase === 'break') && (
        <View style={styles.phaseRow}>
          <View style={[styles.phasePill, { backgroundColor: isWorkPhase ? theme.accent + '20' : '#A78BFA20' }]}>
            <Text style={[styles.phaseText, { color: isWorkPhase ? theme.accent : '#A78BFA' }]}>
              {isWorkPhase ? `🎯 ${t('focus.work')}` : `☕ ${t('focus.break')}`}
            </Text>
          </View>
          {sessionsCompleted > 0 && (
            <Text style={[styles.sessionCount, { color: theme.textMuted }]}>
              {sessionsCompleted} ✅
            </Text>
          )}
        </View>
      )}

      {/* Timer circle */}
      <View style={styles.timerContainer}>
        <View style={[styles.timerOuter, { width: size, height: size }]}>
          {/* Background circle */}
          <View
            style={[
              styles.timerCircleBg,
              { width: size, height: size, borderColor: theme.surfaceLight, borderWidth: strokeWidth, borderRadius: size / 2 },
            ]}
          />
          {/* Inner content */}
          <View
            style={[
              styles.timerInner,
              {
                width: size - strokeWidth * 4,
                height: size - strokeWidth * 4,
                borderRadius: (size - strokeWidth * 4) / 2,
                backgroundColor: theme.surface,
              },
            ]}
          >
            {phase === 'completed' ? (
              <>
                <Text style={[styles.completedEmoji]}>🎉</Text>
                <Text style={[styles.completedText, { color: theme.accent }]}>{t('focus.completed')}</Text>
              </>
            ) : (
              <Text style={[styles.timerText, { color: phase === 'break' ? '#A78BFA' : theme.text }]}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </Text>
            )}
          </View>
          {/* Glow ring */}
          {(phase === 'work' || phase === 'break') && (
            <View
              style={[
                styles.glowRing,
                {
                  width: size + 20,
                  height: size + 20,
                  borderRadius: (size + 20) / 2,
                  borderColor: ringColor + '30',
                },
              ]}
            />
          )}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {phase === 'idle' && (
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: theme.accent }]}
            onPress={startWork}
          >
            <Text style={styles.startBtnText}>{t('focus.start')}</Text>
          </TouchableOpacity>
        )}

        {(phase === 'work' || phase === 'break') && (
          <TouchableOpacity
            style={[styles.stopBtn, { backgroundColor: theme.error }]}
            onPress={stopTimer}
          >
            <Text style={styles.stopBtnText}>{t('focus.stop')}</Text>
          </TouchableOpacity>
        )}

        {phase === 'completed' && (
          <View style={styles.completedActions}>
            <Text style={[styles.xpEarned, { color: theme.accent }]}>
              +{workDuration >= 25 ? 20 : 10} XP 🎉
            </Text>
            <Text style={[styles.sessionsText, { color: theme.textSecondary }]}>
              {sessionsCompleted} {sessionsCompleted === 1 ? 'session' : 'sessions'}
            </Text>
            <View style={{ marginVertical: 8, width: '100%' }}>
              <RewardedAdButton xpAmount={20} type="focus_bonus" emoji="⏱️" label={t('ads.focusBonus').replace('{xp}', '20')} />
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.accent }]}
              onPress={startAnotherRound}
            >
              <Text style={styles.actionBtnText}>🔄 {t('focus.restart')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surface }]}
              onPress={resetAll}
            >
              <Text style={[styles.actionBtnTextSecondary, { color: theme.text }]}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12,
  },
  closeBtn: { fontSize: 22, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '900' },
  durationRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 16 },
  durationBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  durationText: { fontSize: 16, fontWeight: '700' },
  habitSelector: { marginTop: 20, paddingHorizontal: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  habitRow: { flexDirection: 'row', gap: 8 },
  habitChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, gap: 6, maxWidth: 160,
  },
  habitChipEmoji: { fontSize: 16 },
  habitChipText: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
  phaseRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 20, gap: 12,
  },
  phasePill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  phaseText: { fontSize: 15, fontWeight: '700' },
  sessionCount: { fontSize: 14, fontWeight: '600' },
  timerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  timerOuter: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  timerCircleBg: { position: 'absolute' },
  timerInner: { alignItems: 'center', justifyContent: 'center' },
  timerText: { fontSize: 48, fontWeight: '900', letterSpacing: 2 },
  completedEmoji: { fontSize: 40, marginBottom: 8 },
  completedText: { fontSize: 18, fontWeight: '700' },
  glowRing: { position: 'absolute', borderWidth: 3, opacity: 0.5 },
  actions: { paddingHorizontal: 20, paddingBottom: 50 },
  startBtn: {
    paddingVertical: 16, borderRadius: 18, alignItems: 'center',
    shadowColor: '#00D9A5', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  startBtnText: { color: '#0A0A0F', fontSize: 18, fontWeight: '800' },
  stopBtn: { paddingVertical: 16, borderRadius: 18, alignItems: 'center' },
  stopBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  completedActions: { alignItems: 'center', gap: 12 },
  xpEarned: { fontSize: 24, fontWeight: '900' },
  sessionsText: { fontSize: 14 },
  actionBtn: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14, minWidth: 200, alignItems: 'center' },
  actionBtnText: { color: '#0A0A0F', fontSize: 16, fontWeight: '700' },
  actionBtnTextSecondary: { fontSize: 16, fontWeight: '600' },
});
