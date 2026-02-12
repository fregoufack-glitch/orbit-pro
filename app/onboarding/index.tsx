import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Animated, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import * as Notifications from 'expo-notifications';

const { width } = Dimensions.get('window');

const OBJECTIVES = [
  'obj_health', 'obj_productivity', 'obj_mindfulness',
  'obj_learning', 'obj_social', 'obj_creativity',
];

const SUGGESTED_ROUTINES = [
  { emoji: '☀️', key: 'morning', name: { fr: 'Routine Matinale', en: 'Morning Routine' } },
  { emoji: '🧘', key: 'meditation', name: { fr: 'Méditation quotidienne', en: 'Daily Meditation' } },
  { emoji: '📚', key: 'reading', name: { fr: 'Lecture 20 min', en: '20 min Reading' } },
  { emoji: '💪', key: 'exercise', name: { fr: 'Exercice physique', en: 'Physical Exercise' } },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme, completeOnboarding, updateProfile, language } = useApp();
  const [step, setStep] = useState(0);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const scrollX = useRef(new Animated.Value(0)).current;

  function toggleObjective(obj: string) {
    setSelectedObjectives(prev =>
      prev.includes(obj) ? prev.filter(o => o !== obj) : [...prev, obj]
    );
  }

  async function handleEnableNotifications() {
    if (Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        await updateProfile({ notification_enabled: true });
      }
    }
    finishOnboarding();
  }

  async function finishOnboarding() {
    await completeOnboarding(selectedObjectives);
    router.replace('/tabs');
  }

  function renderStep1() {
    return (
      <View style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: theme.text }]}>{t('onboarding.step1_title')}</Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>{t('onboarding.step1_subtitle')}</Text>
        <View style={styles.objectivesGrid}>
          {OBJECTIVES.map(obj => {
            const selected = selectedObjectives.includes(obj);
            return (
              <TouchableOpacity
                key={obj}
                style={[
                  styles.objectiveCard,
                  { backgroundColor: selected ? theme.accent + '20' : theme.surface, borderColor: selected ? theme.accent : theme.border },
                ]}
                onPress={() => toggleObjective(obj)}
              >
                <Text style={[styles.objectiveText, { color: selected ? theme.accent : theme.text }]}>
                  {t(`onboarding.${obj}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: theme.accent }]} onPress={() => setStep(1)}>
          <Text style={styles.nextBtnText}>{t('common.next')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderStep2() {
    return (
      <View style={styles.stepContainer}>
        <Text style={[styles.stepTitle, { color: theme.text }]}>{t('onboarding.step2_title')}</Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>{t('onboarding.step2_subtitle')}</Text>
        <View style={styles.routineList}>
          {SUGGESTED_ROUTINES.map(routine => (
            <View key={routine.key} style={[styles.routineCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.routineEmoji}>{routine.emoji}</Text>
              <Text style={[styles.routineName, { color: theme.text }]}>
                {routine.name[language as 'fr' | 'en'] || routine.name.en}
              </Text>
            </View>
          ))}
        </View>
        <Text style={[styles.routineNote, { color: theme.textMuted }]}>
          {language === 'fr' ? 'Vous pourrez les ajouter depuis le Marketplace' : 'You can add them from the Marketplace'}
        </Text>
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: theme.accent }]} onPress={() => setStep(2)}>
          <Text style={styles.nextBtnText}>{t('common.next')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderStep3() {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.bellEmoji}>🔔</Text>
        <Text style={[styles.stepTitle, { color: theme.text }]}>{t('onboarding.step3_title')}</Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>{t('onboarding.step3_subtitle')}</Text>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: theme.accent, marginTop: 40 }]}
          onPress={handleEnableNotifications}
        >
          <Text style={styles.nextBtnText}>{t('onboarding.enable_notifications')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={finishOnboarding}>
          <Text style={[styles.skipText, { color: theme.textSecondary }]}>{t('common.skip')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, { backgroundColor: i === step ? theme.accent : theme.border }]} />
        ))}
      </View>
      {step === 0 && renderStep1()}
      {step === 1 && renderStep2()}
      {step === 2 && renderStep3()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 80 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30, gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  stepContainer: { flex: 1, padding: 24 },
  stepTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  stepSubtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
  objectivesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  objectiveCard: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  objectiveText: { fontSize: 15, fontWeight: '600' },
  nextBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  nextBtnText: { color: '#0A0E1A', fontSize: 17, fontWeight: '700' },
  routineList: { gap: 12 },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  routineEmoji: { fontSize: 28 },
  routineName: { fontSize: 16, fontWeight: '600' },
  routineNote: { fontSize: 13, textAlign: 'center', marginTop: 16 },
  bellEmoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  skipBtn: { marginTop: 16, alignItems: 'center' },
  skipText: { fontSize: 16 },
});
