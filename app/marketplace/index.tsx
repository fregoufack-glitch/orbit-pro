import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import { MARKETPLACE_ROUTINES } from '../../constants/theme';
import BannerAd from '../../components/BannerAd';

export default function MarketplaceScreen() {
  const router = useRouter();
  const { theme, language, createHabit } = useApp();
  const [installedRoutines, setInstalledRoutines] = useState<Set<string>>(new Set());

  async function installRoutine(routine: typeof MARKETPLACE_ROUTINES[0]) {
    for (const habit of routine.habits) {
      await createHabit({
        name: habit.name[language as 'fr' | 'en'] || habit.name.en,
        emoji: habit.emoji,
        color: habit.color,
        category: habit.category,
        frequency: 'daily',
        duration_minutes: habit.duration,
      });
    }

    setInstalledRoutines(prev => new Set([...prev, routine.id]));
    Alert.alert('✅', t('marketplace.install_success'));
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('marketplace.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('marketplace.subtitle')}</Text>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>🆓 {t('marketplace.free_routines')}</Text>
      {MARKETPLACE_ROUTINES.map(routine => {
        const installed = installedRoutines.has(routine.id);
        return (
          <View key={routine.id} style={[styles.routineCard, { backgroundColor: theme.surface }]}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineEmoji}>{routine.emoji}</Text>
              <View style={styles.routineInfo}>
                <Text style={[styles.routineName, { color: theme.text }]}>
                  {routine.name[language as 'fr' | 'en']}
                </Text>
                <Text style={[styles.routineDesc, { color: theme.textSecondary }]}>
                  {routine.desc[language as 'fr' | 'en']}
                </Text>
                <Text style={[styles.routineHabits, { color: theme.textMuted }]}>
                  {routine.habits.length} {t('marketplace.habits_count')}
                </Text>
              </View>
            </View>
            <View style={styles.routineHabitList}>
              {routine.habits.map((habit, i) => (
                <View key={i} style={[styles.habitPill, { backgroundColor: habit.color + '20' }]}>
                  <Text style={{ fontSize: 14 }}>{habit.emoji}</Text>
                  <Text style={[styles.habitPillText, { color: theme.text }]}>
                    {habit.name[language as 'fr' | 'en']}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.installBtn, { backgroundColor: installed ? theme.surfaceLight : theme.accent }]}
              onPress={() => !installed && installRoutine(routine)}
              disabled={installed}
            >
              <Text style={[styles.installBtnText, { color: installed ? theme.textMuted : '#0A0E1A' }]}>
                {installed ? `✅ ${t('common.installed')}` : `📥 ${t('common.install')}`}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <BannerAd />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  closeBtn: { fontSize: 22, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginLeft: 16, marginTop: 8, marginBottom: 12 },
  routineCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12 },
  routineHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  routineEmoji: { fontSize: 36 },
  routineInfo: { flex: 1 },
  routineName: { fontSize: 17, fontWeight: '700' },
  routineDesc: { fontSize: 13, marginTop: 2 },
  routineHabits: { fontSize: 12, marginTop: 4 },
  routineHabitList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  habitPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 4 },
  habitPillText: { fontSize: 12, fontWeight: '600' },
  installBtn: { height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  installBtnText: { fontSize: 15, fontWeight: '700' },
});
