import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';

const EMOJIS = ['⭐', '💪', '🧘', '📚', '🏃', '💧', '🥗', '📖', '✏️', '🎯', '🧠', '💤', '🎨', '📞', '🌿', '☀️', '🔥', '💎', '🎵', '🏋️'];
const COLORS = ['#00D9A5', '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#F472B6', '#60A5FA', '#FB923C'];
const CATEGORIES = ['general', 'health', 'productivity', 'mindfulness', 'learning', 'social', 'creativity'];
const FREQUENCIES = ['daily', 'weekdays', 'weekends', 'custom'];

export default function EditHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, updateHabit, deleteHabit, theme } = useApp();
  const habit = habits.find(h => h.id === id);

  const [name, setName] = useState(habit?.name || '');
  const [emoji, setEmoji] = useState(habit?.emoji || '⭐');
  const [color, setColor] = useState(habit?.color || '#00D9A5');
  const [category, setCategory] = useState(habit?.category || 'general');
  const [frequency, setFrequency] = useState(habit?.frequency || 'daily');
  const [targetTime, setTargetTime] = useState(habit?.target_time || '');
  const [duration, setDuration] = useState(String(habit?.duration_minutes || ''));

  if (!habit) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.textSecondary }}>Habit not found</Text>
      </View>
    );
  }

  async function handleSave() {
    if (!name.trim()) return;
    await updateHabit(id!, {
      name: name.trim(),
      emoji,
      color,
      category,
      frequency,
      target_time: targetTime || null,
      duration_minutes: parseInt(duration) || 0,
    });
    router.back();
  }

  function handleDelete() {
    Alert.alert(t('habits.delete_confirm'), '', [
      { text: t('common.cancel') },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await deleteHabit(id!); router.back(); } },
    ]);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('common.edit')}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveBtn, { color: theme.accent }]}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.preview, { backgroundColor: color + '20', borderColor: color }]}>
        <Text style={styles.previewEmoji}>{emoji}</Text>
        <Text style={[styles.previewName, { color: theme.text }]}>{name}</Text>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('habits.name')}</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} value={name} onChangeText={setName} />

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('habits.emoji')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
        {EMOJIS.map(e => (
          <TouchableOpacity key={e} style={[styles.emojiBtn, emoji === e && { backgroundColor: theme.accent + '30', borderColor: theme.accent }]} onPress={() => setEmoji(e)}>
            <Text style={styles.emojiBtnText}>{e}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('habits.color')}</Text>
      <View style={styles.colorRow}>
        {COLORS.map(c => (
          <TouchableOpacity key={c} style={[styles.colorBtn, { backgroundColor: c }, color === c && styles.colorBtnActive]} onPress={() => setColor(c)} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('habits.category')}</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.chip, { backgroundColor: category === cat ? theme.accent : theme.surface, borderColor: category === cat ? theme.accent : theme.border }]} onPress={() => setCategory(cat)}>
            <Text style={[styles.chipText, { color: category === cat ? '#0A0E1A' : theme.textSecondary }]}>{t(`habits.cat_${cat}`)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('habits.frequency')}</Text>
      <View style={styles.chipRow}>
        {FREQUENCIES.map(freq => (
          <TouchableOpacity key={freq} style={[styles.chip, { backgroundColor: frequency === freq ? theme.accent : theme.surface, borderColor: frequency === freq ? theme.accent : theme.border }]} onPress={() => setFrequency(freq)}>
            <Text style={[styles.chipText, { color: frequency === freq ? '#0A0E1A' : theme.textSecondary }]}>{t(`habits.${freq}`)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('habits.time')}</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} value={targetTime} onChangeText={setTargetTime} placeholder="08:00" placeholderTextColor={theme.textMuted} />

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('habits.duration')}</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} value={duration} onChangeText={setDuration} placeholder="15" placeholderTextColor={theme.textMuted} keyboardType="numeric" />

      <TouchableOpacity style={[styles.deleteBtn, { borderColor: theme.error }]} onPress={handleDelete}>
        <Text style={[styles.deleteBtnText, { color: theme.error }]}>🗑️ {t('common.delete')}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  closeBtn: { fontSize: 22, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800' },
  saveBtn: { fontSize: 17, fontWeight: '700' },
  preview: { marginHorizontal: 16, padding: 24, borderRadius: 20, alignItems: 'center', borderWidth: 2, marginBottom: 24 },
  previewEmoji: { fontSize: 48, marginBottom: 8 },
  previewName: { fontSize: 20, fontWeight: '700' },
  label: { fontSize: 14, fontWeight: '600', marginLeft: 16, marginBottom: 8, marginTop: 16 },
  input: { marginHorizontal: 16, height: 52, borderRadius: 14, paddingHorizontal: 16, fontSize: 16, borderWidth: 1 },
  pickerRow: { marginLeft: 16, maxHeight: 52 },
  emojiBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  emojiBtnText: { fontSize: 24 },
  colorRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, flexWrap: 'wrap' },
  colorBtn: { width: 40, height: 40, borderRadius: 20 },
  colorBtnActive: { borderWidth: 3, borderColor: '#FFF' },
  chipRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  deleteBtn: { marginHorizontal: 16, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 32, borderWidth: 2 },
  deleteBtnText: { fontSize: 16, fontWeight: '700' },
});
