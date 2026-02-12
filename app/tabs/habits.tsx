import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Animated, PanResponder, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';

const CATEGORIES = ['all', 'health', 'productivity', 'mindfulness', 'learning', 'social', 'creativity', 'general'];
const { width } = Dimensions.get('window');

function SwipeableHabitCard({ habit, onComplete, onDelete, theme }: any) {
  const translateX = useRef(new Animated.Value(0)).current;
  const { todayCompletions } = useApp();
  const isCompleted = todayCompletions.some((c: any) => c.habit_id === habit.id);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -100) {
          Alert.alert(
            t('habits.delete_confirm'),
            '',
            [
              { text: t('common.cancel'), onPress: () => Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start() },
              { text: t('common.delete'), style: 'destructive', onPress: () => onDelete(habit.id) },
            ]
          );
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.swipeContainer}>
      <View style={[styles.deleteBackground, { backgroundColor: theme.error }]}>
        <Text style={styles.deleteText}>🗑️</Text>
      </View>
      <Animated.View style={[{ transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <TouchableOpacity
          style={[styles.habitCard, { backgroundColor: theme.surface, borderLeftColor: habit.color, borderLeftWidth: 4 }]}
          onPress={() => onComplete(habit.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkCircle, { borderColor: isCompleted ? theme.accent : theme.border, backgroundColor: isCompleted ? theme.accent + '20' : 'transparent' }]}>
            <Text style={{ fontSize: 20 }}>{isCompleted ? '✅' : habit.emoji}</Text>
          </View>
          <View style={styles.habitInfo}>
            <Text style={[styles.habitName, { color: isCompleted ? theme.accent : theme.text, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>
              {habit.name}
            </Text>
            <View style={styles.habitMeta}>
              <Text style={[styles.habitCategory, { color: theme.textMuted, backgroundColor: theme.surfaceLight }]}>
                {t(`habits.cat_${habit.category}`)}
              </Text>
              {habit.target_time && (
                <Text style={[styles.habitTime, { color: theme.textMuted }]}>🕐 {habit.target_time}</Text>
              )}
              {habit.duration_minutes > 0 && (
                <Text style={[styles.habitTime, { color: theme.textMuted }]}>⏱️ {habit.duration_minutes}min</Text>
              )}
            </View>
          </View>
          {isCompleted && (
            <View style={[styles.xpTag, { backgroundColor: theme.accent + '20' }]}>
              <Text style={[styles.xpTagText, { color: theme.accent }]}>+10</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, theme, toggleHabitCompletion, deleteHabit } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredHabits = habits.filter(h => {
    if (!h.is_active) return false;
    if (filter !== 'all' && h.category !== filter) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('habits.title')}</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.accent }]}
          onPress={() => router.push('/habits/create')}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        style={[styles.searchInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder={t('common.search')}
        placeholderTextColor={theme.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, { backgroundColor: filter === cat ? theme.accent : theme.surface, borderColor: filter === cat ? theme.accent : theme.border }]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.filterText, { color: filter === cat ? '#0A0E1A' : theme.textSecondary }]}>
              {cat === 'all' ? t('habits.filter_all') : t(`habits.cat_${cat}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Habits List */}
      <ScrollView style={styles.list}>
        {filteredHabits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('habits.empty')}</Text>
          </View>
        ) : (
          filteredHabits.map(habit => (
            <SwipeableHabitCard
              key={habit.id}
              habit={habit}
              theme={theme}
              onComplete={toggleHabitCompletion}
              onDelete={deleteHabit}
            />
          ))
        )}
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
  searchInput: {
    marginHorizontal: 16,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 12,
  },
  filterRow: { maxHeight: 44, marginBottom: 12 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },
  list: { flex: 1 },
  swipeContainer: { marginHorizontal: 16, marginBottom: 10, borderRadius: 16, overflow: 'hidden' },
  deleteBackground: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
  deleteText: { fontSize: 24 },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  checkCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  habitMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  habitCategory: { fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  habitTime: { fontSize: 11 },
  xpTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  xpTagText: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16 },
});
