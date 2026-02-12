import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import { BADGES, SECRET_BADGES } from '../../constants/theme';

// Heatmap component
function HeatmapCalendar({ stats, theme }: { stats: any[]; theme: any }) {
  const weeks = 12;
  const days = 7;
  const cellSize = 14;
  const gap = 3;

  // Build date → completion map
  const dateMap: Record<string, number> = {};
  let maxVal = 1;
  stats.forEach(s => {
    const val = s.habits_completed || 0;
    dateMap[s.date] = val;
    if (val > maxVal) maxVal = val;
  });

  // Generate grid: 12 weeks back from today
  const today = new Date();
  const grid: Array<{ date: string; value: number }[]> = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const week: Array<{ date: string; value: number }> = [];
    for (let d = 0; d < days; d++) {
      const dayOffset = w * 7 + (6 - today.getDay() + d) % 7 + (today.getDay() === 0 ? 0 : 7 - today.getDay());
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + (days - 1 - d)));
      const dateStr = date.toISOString().split('T')[0];
      week.push({ date: dateStr, value: dateMap[dateStr] || 0 });
    }
    grid.push(week);
  }

  function getColor(value: number): string {
    if (value === 0) return theme.surfaceLight || '#1E2438';
    const ratio = value / maxVal;
    if (ratio <= 0.25) return '#0A5C47';
    if (ratio <= 0.5) return '#0D7A5F';
    if (ratio <= 0.75) return '#10B88A';
    return '#00D9A5';
  }

  const [selectedDay, setSelectedDay] = useState<{ date: string; value: number } | null>(null);

  return (
    <View>
      <View style={styles.heatmapGrid}>
        {grid.map((week, wi) => (
          <View key={wi} style={styles.heatmapCol}>
            {week.map((day, di) => (
              <TouchableOpacity
                key={di}
                style={[styles.heatmapCell, { width: cellSize, height: cellSize, backgroundColor: getColor(day.value), borderRadius: 3 }]}
                onPress={() => setSelectedDay(day)}
              />
            ))}
          </View>
        ))}
      </View>
      {selectedDay && (
        <View style={[styles.heatmapDetail, { backgroundColor: theme.surfaceLight }]}>
          <Text style={[styles.heatmapDetailText, { color: theme.text }]}>
            {selectedDay.date}: {selectedDay.value} {t('stats.habits_completed').toLowerCase()}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function StatsScreen() {
  const router = useRouter();
  const { profile, theme, badges: userBadges, habits, todayCompletions, loadDailyStats, language } = useApp();
  const [weekStats, setWeekStats] = useState<any[]>([]);
  const [allStats, setAllStats] = useState<any[]>([]);

  useEffect(() => {
    loadDailyStats(7).then(setWeekStats);
    loadDailyStats(84).then(setAllStats); // 12 weeks for heatmap
  }, []);

  const totalCompleted = weekStats.reduce((sum, d) => sum + (d.habits_completed || 0), 0);
  const totalXP = profile?.xp || 0;
  const bestStreak = profile?.longest_streak || 0;
  const perfectDays = weekStats.filter(d => d.perfect_day).length;
  const avgCompletion = weekStats.length > 0
    ? Math.round(weekStats.reduce((sum, d) => sum + (d.habits_total > 0 ? (d.habits_completed / d.habits_total) * 100 : 0), 0) / weekStats.length)
    : 0;

  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const maxCompleted = Math.max(...weekStats.map(d => d.habits_completed || 0), 1);

  // Earned badge IDs
  const earnedIds = new Set(userBadges.map(b => b.badge_id));

  // Combine visible badges: all normal badges + earned secret badges only
  const allBadges = BADGES;
  const visibleSecrets = SECRET_BADGES.filter(b => earnedIds.has(b.id));

  // Mood data from stats
  const moodStats = allStats.filter(s => s.mood_emoji);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('stats.title')}</Text>
        <TouchableOpacity onPress={() => router.push('/weekly-report')}>
          <Text style={[styles.reportLink, { color: theme.accent }]}>📋 {t('weekly.title')}</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.kpiEmoji}>✅</Text>
          <Text style={[styles.kpiValue, { color: theme.accent }]}>{totalCompleted}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t('stats.habits_completed')}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.kpiEmoji}>⚡</Text>
          <Text style={[styles.kpiValue, { color: '#FFE66D' }]}>{totalXP}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t('stats.total_xp')}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.kpiEmoji}>🔥</Text>
          <Text style={[styles.kpiValue, { color: '#FF6B6B' }]}>{bestStreak}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t('stats.best_streak')}</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
          <Text style={styles.kpiEmoji}>⭐</Text>
          <Text style={[styles.kpiValue, { color: '#A78BFA' }]}>{perfectDays}</Text>
          <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t('stats.perfect_days')}</Text>
        </View>
      </View>

      {/* Heatmap */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>🗓️ {t('stats.heatmap')}</Text>
        <HeatmapCalendar stats={allStats} theme={theme} />
      </View>

      {/* Completion Rate */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t('stats.completion_rate')}</Text>
        <View style={styles.rateContainer}>
          <Text style={[styles.rateValue, { color: theme.accent }]}>{avgCompletion}%</Text>
          <View style={[styles.rateBar, { backgroundColor: theme.surfaceLight }]}>
            <View style={[styles.rateFill, { backgroundColor: theme.accent, width: `${avgCompletion}%` }]} />
          </View>
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t('stats.weekly_chart')}</Text>
        <View style={styles.chartContainer}>
          {Array.from({ length: 7 }).map((_, i) => {
            const stat = weekStats[i];
            const completed = stat?.habits_completed || 0;
            const height = maxCompleted > 0 ? (completed / maxCompleted) * 120 : 0;
            return (
              <View key={i} style={styles.chartCol}>
                <View style={[styles.chartBar, { height: Math.max(height, 4), backgroundColor: completed > 0 ? theme.accent : theme.surfaceLight }]} />
                <Text style={[styles.chartLabel, { color: theme.textMuted }]}>{dayNames[i]}</Text>
                <Text style={[styles.chartValue, { color: theme.textSecondary }]}>{completed}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Mood Correlation */}
      {moodStats.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>😊 {t('stats.mood_correlation')}</Text>
          <View style={styles.moodRow}>
            {moodStats.slice(-7).map((s, i) => (
              <View key={i} style={styles.moodItem}>
                <Text style={styles.moodEmoji}>{s.mood_emoji}</Text>
                <Text style={[styles.moodDate, { color: theme.textMuted }]}>{s.date?.slice(5)}</Text>
                <Text style={[styles.moodHabits, { color: theme.textSecondary }]}>{s.habits_completed || 0}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Per Habit */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{t('stats.per_habit')}</Text>
        {habits.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t('stats.no_data')}</Text>
        ) : (
          habits.map(habit => {
            const completedToday = todayCompletions.some(c => c.habit_id === habit.id);
            return (
              <View key={habit.id} style={[styles.habitStat, { borderBottomColor: theme.border }]}>
                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                <View style={styles.habitStatInfo}>
                  <Text style={[styles.habitStatName, { color: theme.text }]}>{habit.name}</Text>
                  <View style={[styles.habitBar, { backgroundColor: theme.surfaceLight }]}>
                    <View style={[styles.habitBarFill, { backgroundColor: habit.color, width: completedToday ? '100%' : '0%' }]} />
                  </View>
                </View>
                <Text style={{ fontSize: 16 }}>{completedToday ? '✅' : '⬜'}</Text>
              </View>
            );
          })
        )}
      </View>

      {/* AI Insights */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>🧠 {t('stats.ai_insights')}</Text>
        <View style={[styles.insightBox, { backgroundColor: theme.accent + '10', borderColor: theme.accent }]}>
          <Text style={[styles.insightText, { color: theme.text }]}>
            {language === 'fr'
              ? totalCompleted > 10
                ? '🚀 Excellente semaine ! Vous êtes sur une lancée. Continuez à maintenir votre série pour gagner des bonus XP.'
                : totalCompleted > 0
                  ? '💪 Bon début ! Essayez de compléter au moins 3 habitudes par jour pour débloquer la mission quotidienne.'
                  : '🌱 Commencez par ajouter quelques habitudes simples. La constance est plus importante que la perfection.'
              : totalCompleted > 10
                ? '🚀 Excellent week! You\'re on a roll. Keep your streak going for bonus XP.'
                : totalCompleted > 0
                  ? '💪 Good start! Try completing at least 3 habits daily to unlock the daily mission.'
                  : '🌱 Start by adding a few simple habits. Consistency matters more than perfection.'
            }
          </Text>
        </View>
      </View>

      {/* Badges */}
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>🏆 {t('stats.badges')}</Text>
        <View style={styles.badgeGrid}>
          {allBadges.map(badge => {
            const earned = earnedIds.has(badge.id);
            return (
              <View key={badge.id} style={[styles.badgeItem, { opacity: earned ? 1 : 0.3 }]}>
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                <Text style={[styles.badgeName, { color: earned ? theme.text : theme.textMuted }]}>
                  {badge.name[language as 'fr' | 'en']}
                </Text>
                <Text style={[styles.badgeDesc, { color: theme.textMuted }]}>
                  {badge.desc[language as 'fr' | 'en']}
                </Text>
              </View>
            );
          })}
          {/* Secret badges - only show earned ones */}
          {visibleSecrets.map(badge => (
            <View key={badge.id} style={[styles.badgeItem, { opacity: 1 }]}>
              <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
              <Text style={[styles.badgeName, { color: theme.accent }]}>
                {badge.name[language as 'fr' | 'en']}
              </Text>
              <Text style={[styles.badgeDesc, { color: theme.textMuted }]}>
                {badge.desc[language as 'fr' | 'en']}
              </Text>
              <Text style={[styles.secretLabel, { color: theme.accent }]}>🤫 Secret</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '900' },
  reportLink: { fontSize: 14, fontWeight: '700' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  kpiCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 4 },
  kpiEmoji: { fontSize: 28, marginBottom: 4 },
  kpiValue: { fontSize: 28, fontWeight: '900' },
  kpiLabel: { fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  card: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  rateContainer: { alignItems: 'center' },
  rateValue: { fontSize: 36, fontWeight: '900', marginBottom: 8 },
  rateBar: { height: 10, borderRadius: 5, width: '100%', overflow: 'hidden' },
  rateFill: { height: '100%', borderRadius: 5 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, paddingTop: 20 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartBar: { width: 24, borderRadius: 12, marginBottom: 8 },
  chartLabel: { fontSize: 12, fontWeight: '600' },
  chartValue: { fontSize: 11, marginTop: 2 },
  habitStat: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, gap: 12 },
  habitEmoji: { fontSize: 24 },
  habitStatInfo: { flex: 1 },
  habitStatName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  habitBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  habitBarFill: { height: '100%', borderRadius: 3 },
  insightBox: { padding: 16, borderRadius: 14, borderWidth: 1 },
  insightText: { fontSize: 14, lineHeight: 22 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeItem: { width: '30%', alignItems: 'center', marginBottom: 12 },
  badgeEmoji: { fontSize: 32, marginBottom: 4 },
  badgeName: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  badgeDesc: { fontSize: 10, textAlign: 'center', marginTop: 2 },
  secretLabel: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  emptyText: { fontSize: 14, textAlign: 'center', padding: 20 },
  // Heatmap
  heatmapGrid: { flexDirection: 'row', gap: 3, justifyContent: 'center' },
  heatmapCol: { gap: 3 },
  heatmapCell: {},
  heatmapDetail: { marginTop: 8, padding: 8, borderRadius: 8, alignItems: 'center' },
  heatmapDetailText: { fontSize: 12, fontWeight: '600' },
  // Mood
  moodRow: { flexDirection: 'row', justifyContent: 'space-around' },
  moodItem: { alignItems: 'center', gap: 2 },
  moodEmoji: { fontSize: 24 },
  moodDate: { fontSize: 10 },
  moodHabits: { fontSize: 11, fontWeight: '600' },
});
