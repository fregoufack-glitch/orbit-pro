import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';
import { t } from '../i18n';
import RewardedAdButton from '../components/RewardedAdButton';

export default function WeeklyReportScreen() {
  const router = useRouter();
  const { theme, profile, habits, loadDailyStats, language } = useApp();
  const [thisWeek, setThisWeek] = useState<any[]>([]);
  const [lastWeek, setLastWeek] = useState<any[]>([]);

  useEffect(() => {
    loadDailyStats(7).then(setThisWeek);
    loadDailyStats(14).then(all => {
      setLastWeek(all.slice(0, Math.max(0, all.length - 7)));
    });
  }, []);

  const thisTotal = thisWeek.reduce((s, d) => s + (d.habits_completed || 0), 0);
  const lastTotal = lastWeek.reduce((s, d) => s + (d.habits_completed || 0), 0);
  const thisXP = thisWeek.reduce((s, d) => s + (d.xp_earned || 0), 0);
  const lastXP = lastWeek.reduce((s, d) => s + (d.xp_earned || 0), 0);
  const thisPerfect = thisWeek.filter(d => d.perfect_day).length;
  const lastPerfect = lastWeek.filter(d => d.perfect_day).length;

  const dayNames = language === 'fr'
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Best day
  let bestDayIdx = 0;
  let bestDayCount = 0;
  thisWeek.forEach((d, i) => {
    if ((d.habits_completed || 0) > bestDayCount) {
      bestDayCount = d.habits_completed;
      bestDayIdx = new Date(d.date).getDay();
    }
  });
  const bestDay = dayNames[bestDayIdx === 0 ? 6 : bestDayIdx - 1] || dayNames[0];

  // Most consistent habit (placeholder logic based on completion rate)
  const topHabit = habits.length > 0 ? habits[0] : null;

  function arrow(current: number, previous: number) {
    if (current > previous) return '↑';
    if (current < previous) return '↓';
    return '=';
  }

  function arrowColor(current: number, previous: number) {
    if (current > previous) return '#00D9A5';
    if (current < previous) return '#FF6B6B';
    return theme.textMuted;
  }

  // Motivational message
  const avgRate = thisWeek.length > 0
    ? thisWeek.reduce((s, d) => s + (d.habits_total > 0 ? d.habits_completed / d.habits_total : 0), 0) / thisWeek.length
    : 0;
  const motivation = avgRate >= 0.8
    ? (language === 'fr' ? '🏆 Semaine exceptionnelle ! Tu es en feu !' : '🏆 Exceptional week! You\'re on fire!')
    : avgRate >= 0.5
      ? (language === 'fr' ? '💪 Belle progression ! Continue sur cette lancée !' : '💪 Great progress! Keep it up!')
      : avgRate > 0
        ? (language === 'fr' ? '🌱 Chaque petit pas compte. La semaine prochaine sera meilleure !' : '🌱 Every small step counts. Next week will be better!')
        : (language === 'fr' ? '🚀 Nouvelle semaine, nouvelles opportunités ! Lance-toi !' : '🚀 New week, new opportunities! Go for it!');

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>📋 {t('weekly.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Motivation card */}
      <View style={[styles.card, { backgroundColor: theme.accent + '15', borderColor: theme.accent }]}>
        <Text style={[styles.motivationText, { color: theme.text }]}>{motivation}</Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.kpiEmoji}>✅</Text>
          <Text style={[styles.kpiValue, { color: theme.accent }]}>{thisTotal}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t('weekly.completed')}</Text>
          <Text style={[styles.kpiCompare, { color: arrowColor(thisTotal, lastTotal) }]}>
            {arrow(thisTotal, lastTotal)} {lastTotal}
          </Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.kpiEmoji}>⚡</Text>
          <Text style={[styles.kpiValue, { color: '#FFE66D' }]}>{thisXP}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t('weekly.xp_earned')}</Text>
          <Text style={[styles.kpiCompare, { color: arrowColor(thisXP, lastXP) }]}>
            {arrow(thisXP, lastXP)} {lastXP}
          </Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.kpiEmoji}>⭐</Text>
          <Text style={[styles.kpiValue, { color: '#A78BFA' }]}>{thisPerfect}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t('weekly.perfect_days')}</Text>
          <Text style={[styles.kpiCompare, { color: arrowColor(thisPerfect, lastPerfect) }]}>
            {arrow(thisPerfect, lastPerfect)} {lastPerfect}
          </Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.kpiEmoji}>🔥</Text>
          <Text style={[styles.kpiValue, { color: '#FF6B6B' }]}>{profile?.streak_days || 0}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t('weekly.streak')}</Text>
          <Text style={[styles.kpiCompare, { color: theme.textMuted }]}>{t('home.days')}</Text>
        </View>
      </View>

      {/* Best day */}
      <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
        <Text style={styles.infoEmoji}>📅</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('weekly.best_day')}</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{bestDay} — {bestDayCount} {t('weekly.completed').toLowerCase()}</Text>
        </View>
      </View>

      {/* Most consistent */}
      {topHabit && (
        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.infoEmoji}>{topHabit.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{t('weekly.most_consistent')}</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{topHabit.name}</Text>
          </View>
        </View>
      )}

      <View style={{ marginHorizontal: 16, marginTop: 20 }}>
        <RewardedAdButton xpAmount={30} type="stats_unlock" emoji="📊" label={t('ads.unlockDetailedStats')} />
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  closeBtn: { fontSize: 22, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '900' },
  card: { marginHorizontal: 16, marginTop: 16, borderRadius: 18, padding: 20, borderWidth: 1 },
  motivationText: { fontSize: 17, fontWeight: '700', textAlign: 'center', lineHeight: 24 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginTop: 16 },
  kpiCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center' },
  kpiEmoji: { fontSize: 28, marginBottom: 4 },
  kpiValue: { fontSize: 28, fontWeight: '900' },
  kpiLabel: { fontSize: 12, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  kpiCompare: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  infoCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16, gap: 12 },
  infoEmoji: { fontSize: 28 },
  infoLabel: { fontSize: 12, fontWeight: '600' },
  infoValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
});
