import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import { format, addDays, startOfWeek } from 'date-fns';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 5); // 5h to 21h

export default function PlannerScreen() {
  const router = useRouter();
  const { activities, loadActivities, theme } = useApp();
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    loadActivities(dateStr);
  }, [dateStr]);

  const dayActivities = activities.filter(a => a.date === dateStr);

  function getActivityForHour(hour: number) {
    return dayActivities.filter(a => {
      const h = parseInt(a.start_time?.split(':')[0] || '0');
      return h === hour;
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('planner.title')}</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/planner/create')}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View style={[styles.toggle, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'day' && { backgroundColor: theme.accent }]}
          onPress={() => setViewMode('day')}
        >
          <Text style={[styles.toggleText, { color: viewMode === 'day' ? '#0A0E1A' : theme.textSecondary }]}>
            {t('planner.day_view')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'week' && { backgroundColor: theme.accent }]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[styles.toggleText, { color: viewMode === 'week' ? '#0A0E1A' : theme.textSecondary }]}>
            {t('planner.week_view')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Week Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {weekDays.map(day => {
          const isSelected = format(day, 'yyyy-MM-dd') === dateStr;
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[styles.dayBtn, isSelected && { backgroundColor: theme.accent }]}
              onPress={() => setSelectedDate(day)}
            >
              <Text style={[styles.dayLabel, { color: isSelected ? '#0A0E1A' : theme.textMuted }]}>
                {format(day, 'EEE').substring(0, 2)}
              </Text>
              <Text style={[styles.dayNum, { color: isSelected ? '#0A0E1A' : theme.text }]}>
                {format(day, 'd')}
              </Text>
              {isToday && !isSelected && <View style={[styles.todayDot, { backgroundColor: theme.accent }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Timeline */}
      <ScrollView style={styles.timeline}>
        {HOURS.map(hour => {
          const hourActivities = getActivityForHour(hour);
          return (
            <View key={hour} style={[styles.timeRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.timeLabel, { color: theme.textMuted }]}>
                {String(hour).padStart(2, '0')}:00
              </Text>
              <View style={styles.timeContent}>
                {hourActivities.length > 0 ? (
                  hourActivities.map(activity => (
                    <TouchableOpacity
                      key={activity.id}
                      style={[styles.activityCard, { backgroundColor: activity.color + '20', borderLeftColor: activity.color }]}
                      onPress={() => {}}
                    >
                      <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                      <View>
                        <Text style={[styles.activityName, { color: theme.text }]}>{activity.name}</Text>
                        <Text style={[styles.activityTime, { color: theme.textMuted }]}>
                          {activity.start_time}{activity.end_time ? ` - ${activity.end_time}` : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyHour} />
                )}
              </View>
            </View>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  title: { fontSize: 28, fontWeight: '900' },
  addBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 24, color: '#0A0E1A', fontWeight: '700' },
  toggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleText: { fontSize: 14, fontWeight: '600' },
  daySelector: { paddingHorizontal: 12, marginBottom: 12, maxHeight: 80 },
  dayBtn: {
    width: 48,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  dayLabel: { fontSize: 12, fontWeight: '600' },
  dayNum: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  todayDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  timeline: { flex: 1 },
  timeRow: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 0.5,
    paddingVertical: 4,
  },
  timeLabel: { width: 60, fontSize: 13, fontWeight: '600', textAlign: 'center', paddingTop: 8 },
  timeContent: { flex: 1, paddingRight: 16 },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 4,
    gap: 10,
  },
  activityEmoji: { fontSize: 20 },
  activityName: { fontSize: 14, fontWeight: '600' },
  activityTime: { fontSize: 12, marginTop: 2 },
  emptyHour: { height: 50 },
});
