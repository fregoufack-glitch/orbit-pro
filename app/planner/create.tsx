import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import { format } from 'date-fns';

const EMOJIS = ['📋', '🏋️', '📚', '💼', '🍽️', '🧘', '🎯', '💊', '🛒', '📞', '✈️', '🎮'];
const COLORS = ['#00D9A5', '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#F472B6', '#60A5FA', '#FB923C'];

export default function CreateActivityScreen() {
  const router = useRouter();
  const { createActivity, theme } = useApp();
  const [name, setName] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const [color, setColor] = useState('#00D9A5');
  const [notes, setNotes] = useState('');

  async function handleCreate() {
    if (!name.trim()) { Alert.alert(t('common.error'), t('planner.activity_name')); return; }
    if (!date) { Alert.alert(t('common.error'), t('planner.date')); return; }
    if (!startTime) { Alert.alert(t('common.error'), t('planner.start_time')); return; }

    await createActivity({
      name: name.trim(),
      date,
      start_time: startTime,
      end_time: endTime || null,
      emoji,
      color,
      notes,
    });
    router.back();
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('planner.add_activity')}</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={[styles.saveBtn, { color: theme.accent }]}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('planner.activity_name')} *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        value={name}
        onChangeText={setName}
        placeholder={t('planner.activity_name')}
        placeholderTextColor={theme.textMuted}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('habits.emoji')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
        {EMOJIS.map(e => (
          <TouchableOpacity key={e} style={[styles.emojiBtn, emoji === e && { backgroundColor: theme.accent + '30', borderColor: theme.accent }]} onPress={() => setEmoji(e)}>
            <Text style={{ fontSize: 24 }}>{e}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('habits.color')}</Text>
      <View style={styles.colorRow}>
        {COLORS.map(c => (
          <TouchableOpacity key={c} style={[styles.colorBtn, { backgroundColor: c }, color === c && styles.colorActive]} onPress={() => setColor(c)} />
        ))}
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('planner.date')} *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        value={date}
        onChangeText={setDate}
        placeholder="2025-01-15"
        placeholderTextColor={theme.textMuted}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('planner.start_time')} *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        value={startTime}
        onChangeText={setStartTime}
        placeholder="09:00"
        placeholderTextColor={theme.textMuted}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>{t('planner.end_time')}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        value={endTime}
        onChangeText={setEndTime}
        placeholder="10:00"
        placeholderTextColor={theme.textMuted}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        placeholder="..."
        placeholderTextColor={theme.textMuted}
      />

      <TouchableOpacity style={[styles.createBtn, { backgroundColor: theme.accent }]} onPress={handleCreate}>
        <Text style={styles.createBtnText}>{t('common.save')}</Text>
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
  label: { fontSize: 14, fontWeight: '600', marginLeft: 16, marginBottom: 8, marginTop: 16 },
  input: { marginHorizontal: 16, height: 52, borderRadius: 14, paddingHorizontal: 16, fontSize: 16, borderWidth: 1 },
  textArea: { height: 90, paddingTop: 14, textAlignVertical: 'top' },
  pickerRow: { marginLeft: 16, maxHeight: 52 },
  emojiBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  colorRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  colorBtn: { width: 36, height: 36, borderRadius: 18 },
  colorActive: { borderWidth: 3, borderColor: '#FFF' },
  createBtn: { marginHorizontal: 16, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  createBtnText: { color: '#0A0E1A', fontSize: 17, fontWeight: '700' },
});
