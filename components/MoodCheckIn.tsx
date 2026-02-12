import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { t } from '../i18n';

const MOODS = [
  { emoji: '😄', label: 'great' },
  { emoji: '😊', label: 'good' },
  { emoji: '😐', label: 'okay' },
  { emoji: '😔', label: 'low' },
  { emoji: '😢', label: 'bad' },
];

export default function MoodCheckIn() {
  const { theme, user } = useApp();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    checkIfNeeded();
  }, [user]);

  async function checkIfNeeded() {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const key = `orbit_mood_${today}`;
    const done = await AsyncStorage.getItem(key);
    if (!done) {
      // Small delay so home loads first
      setTimeout(() => setVisible(true), 2000);
    }
  }

  async function submit() {
    if (!selected || !user) return;
    const today = new Date().toISOString().split('T')[0];

    await supabase.from('daily_stats').upsert({
      user_id: user.id,
      date: today,
      mood_emoji: selected,
      mood_note: note.trim() || null,
    }, { onConflict: 'user_id,date' });

    await AsyncStorage.setItem(`orbit_mood_${today}`, 'true');
    setVisible(false);
    setSelected(null);
    setNote('');
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>{t('mood.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('mood.subtitle')}</Text>

          <View style={styles.moodRow}>
            {MOODS.map(mood => (
              <TouchableOpacity
                key={mood.emoji}
                style={[
                  styles.moodBtn,
                  selected === mood.emoji && { backgroundColor: theme.accent + '30', borderColor: theme.accent },
                ]}
                onPress={() => setSelected(mood.emoji)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.noteInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
            value={note}
            onChangeText={setNote}
            placeholder={t('mood.note_placeholder')}
            placeholderTextColor={theme.textMuted}
            multiline
            maxLength={200}
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={[styles.skipText, { color: theme.textMuted }]}>{t('common.skip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: selected ? theme.accent : theme.surfaceLight }]}
              onPress={submit}
              disabled={!selected}
            >
              <Text style={[styles.submitText, { color: selected ? '#0A0A0F' : theme.textMuted }]}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '85%', borderRadius: 24, padding: 24 },
  title: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  moodBtn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  moodEmoji: { fontSize: 32 },
  noteInput: { borderWidth: 1, borderRadius: 14, padding: 12, fontSize: 14, minHeight: 60, textAlignVertical: 'top', marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipText: { fontSize: 15, fontWeight: '600' },
  submitBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  submitText: { fontSize: 15, fontWeight: '700' },
});
