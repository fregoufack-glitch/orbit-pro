import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import { BADGES } from '../../constants/theme';

const PRESET_AVATARS = [
  '🦁', '🐺', '🦊', '🐻', '🐼', '🐨', '🦉', '🦅', '🐉', '🦄',
  '🐶', '🐱', '🐸', '🐵', '🦋', '🌸', '🌺', '🌻', '🍀', '🔥',
  '⚡', '💎', '🌟', '🚀',
];

const BANNER_PREVIEW_COLORS = [
  '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a',
  '#a18cd1', '#ffecd2', '#ff9a9e', '#89f7fe', '#fd5c63',
  '#1a1a2e', '#0f0c29', '#2d1b69', '#134e5e', '#c31432',
];

const MOOD_PRESETS = [
  { emoji: '🔥', text: 'Grinding' },
  { emoji: '😴', text: 'Resting' },
  { emoji: '💪', text: 'Motivated' },
  { emoji: '🧘', text: 'Zen mode' },
  { emoji: '📚', text: 'Studying' },
  { emoji: '🎉', text: 'Celebrating' },
  { emoji: '🏃', text: 'Active' },
  { emoji: '🎯', text: 'Focused' },
];

const STREAK_STYLES: { id: string; icon: string; label: string }[] = [
  { id: 'flame', icon: '🔥', label: 'Flame' },
  { id: 'lightning', icon: '⚡', label: 'Lightning' },
  { id: 'star', icon: '⭐', label: 'Star' },
  { id: 'diamond', icon: '💎', label: 'Diamond' },
];

const CARD_STYLES = ['minimal', 'detailed', 'compact', 'large'];
const ANIMATION_STYLES = ['bouncy', 'smooth', 'snappy', 'none'];
const NOTIFICATION_SOUNDS = [
  'default', 'chime', 'bell', 'ding', 'pop', 'whoosh', 'ping', 'bubble', 'click', 'sparkle', 'coin',
];
const PRIVACY_OPTIONS: { id: string; icon: string; labelKey: string }[] = [
  { id: 'public', icon: '🌍', labelKey: 'profile.privacy_public' },
  { id: 'friends-only', icon: '👥', labelKey: 'profile.privacy_friends' },
  { id: 'private', icon: '🔒', labelKey: 'profile.privacy_private' },
];

export default function PersonalizationScreen() {
  const router = useRouter();
  const { theme, profile, updateProfile, badges: userBadges, accentColor, setAccentColor } = useApp();

  const [bio, setBio] = useState(profile?.bio || '');
  const [moodEmoji, setMoodEmoji] = useState(profile?.mood_emoji || '');
  const [moodText, setMoodText] = useState(profile?.mood_text || '');
  const [bannerUrl, setBannerUrl] = useState(profile?.banner_url || '');
  const [streakStyle, setStreakStyle] = useState(profile?.streak_style || 'flame');
  const [cardStyle, setCardStyle] = useState(profile?.card_style || 'detailed');
  const [animationStyle, setAnimationStyle] = useState(profile?.animation_style || 'bouncy');
  const [notifSound, setNotifSound] = useState(profile?.notification_sound || 'default');
  const [privacy, setPrivacy] = useState(profile?.privacy || 'public');
  const [badgeShowcase, setBadgeShowcase] = useState<string[]>(
    (profile?.badge_showcase as string[]) || []
  );
  const [customColor, setCustomColor] = useState(accentColor);
  const [saving, setSaving] = useState(false);

  function toggleBadgeShowcase(badgeId: string) {
    setBadgeShowcase(prev => {
      if (prev.includes(badgeId)) return prev.filter(b => b !== badgeId);
      if (prev.length >= 3) {
        Alert.alert(t('profile.max_badges'));
        return prev;
      }
      return [...prev, badgeId];
    });
  }

  async function handleSave() {
    setSaving(true);
    await updateProfile({
      bio: bio.trim(),
      mood_emoji: moodEmoji,
      mood_text: moodText,
      banner_url: bannerUrl || null,
      badge_showcase: badgeShowcase,
      streak_style: streakStyle,
      card_style: cardStyle,
      animation_style: animationStyle,
      notification_sound: notifSound,
      privacy,
    } as any);
    setAccentColor(customColor);
    setSaving(false);
    Alert.alert('✅', t('common.success'));
    router.back();
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('profile.personalization')}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveBtn, { color: theme.accent, opacity: saving ? 0.5 : 1 }]}>
            {t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Presets */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>😀 {t('profile.avatar_presets')}</Text>
        <View style={styles.presetGrid}>
          {PRESET_AVATARS.map(av => (
            <TouchableOpacity key={av} style={[styles.presetItem, { backgroundColor: theme.surfaceLight }]}>
              <Text style={styles.presetEmoji}>{av}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Banner */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🖼️ {t('profile.banner')}</Text>
        <View style={styles.bannerGrid}>
          {BANNER_PREVIEW_COLORS.map((color, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.bannerPreview,
                { backgroundColor: color },
                bannerUrl === color && styles.bannerActive,
              ]}
              onPress={() => setBannerUrl(color)}
            />
          ))}
        </View>
      </View>

      {/* Bio */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>📝 {t('profile.bio')}</Text>
        <TextInput
          style={[styles.bioInput, { backgroundColor: theme.surfaceLight, color: theme.text }]}
          placeholder={t('profile.bio_placeholder')}
          placeholderTextColor={theme.textMuted}
          value={bio}
          onChangeText={setBio}
          maxLength={150}
          multiline
        />
        <Text style={[styles.charCount, { color: theme.textMuted }]}>{bio.length}/150</Text>
      </View>

      {/* Mood/Status */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>😎 {t('profile.mood_status')}</Text>
        <View style={styles.moodPresets}>
          {MOOD_PRESETS.map(m => (
            <TouchableOpacity
              key={m.emoji + m.text}
              style={[
                styles.moodPill,
                { backgroundColor: moodEmoji === m.emoji ? theme.accent + '30' : theme.surfaceLight },
              ]}
              onPress={() => { setMoodEmoji(m.emoji); setMoodText(m.text); }}
            >
              <Text style={[styles.moodPillText, { color: theme.text }]}>{m.emoji} {m.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.moodCustom}>
          <TextInput
            style={[styles.moodInput, { backgroundColor: theme.surfaceLight, color: theme.text }]}
            placeholder={t('profile.custom_mood')}
            placeholderTextColor={theme.textMuted}
            value={moodText}
            onChangeText={setMoodText}
            maxLength={30}
          />
        </View>
      </View>

      {/* Accent Color (RGB) */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🎨 {t('profile.accent_color')}</Text>
        <TextInput
          style={[styles.colorInput, { backgroundColor: theme.surfaceLight, color: theme.text }]}
          placeholder="#00D9A5"
          placeholderTextColor={theme.textMuted}
          value={customColor}
          onChangeText={setCustomColor}
          maxLength={7}
          autoCapitalize="none"
        />
        <View style={[styles.colorPreview, { backgroundColor: customColor }]} />
      </View>

      {/* Badge Showcase */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          🏆 {t('profile.badge_showcase_title')} ({badgeShowcase.length}/3)
        </Text>
        <View style={styles.badgeGrid}>
          {userBadges.map(ub => {
            const selected = badgeShowcase.includes(ub.badge_id);
            return (
              <TouchableOpacity
                key={ub.id}
                style={[styles.badgeItem, { backgroundColor: selected ? theme.accent + '30' : theme.surfaceLight }]}
                onPress={() => toggleBadgeShowcase(ub.badge_id)}
              >
                <Text style={styles.badgeEmoji}>{ub.badge_emoji}</Text>
                <Text style={[styles.badgeName, { color: theme.text }]}>{ub.badge_name}</Text>
              </TouchableOpacity>
            );
          })}
          {userBadges.length === 0 && (
            <Text style={[styles.noBadges, { color: theme.textMuted }]}>{t('profile.no_badges_yet')}</Text>
          )}
        </View>
      </View>

      {/* Streak Style */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.streak_style')}</Text>
        <View style={styles.optionRow}>
          {STREAK_STYLES.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.optionItem, { backgroundColor: streakStyle === s.id ? theme.accent + '30' : theme.surfaceLight }]}
              onPress={() => setStreakStyle(s.id)}
            >
              <Text style={styles.optionEmoji}>{s.icon}</Text>
              <Text style={[styles.optionLabel, { color: theme.text }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Card Style */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.card_style')}</Text>
        <View style={styles.optionRow}>
          {CARD_STYLES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.optionPill, { backgroundColor: cardStyle === s ? theme.accent : theme.surfaceLight }]}
              onPress={() => setCardStyle(s)}
            >
              <Text style={[styles.optionPillText, { color: cardStyle === s ? '#0A0E1A' : theme.textSecondary }]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Animation Style */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.animation_style')}</Text>
        <View style={styles.optionRow}>
          {ANIMATION_STYLES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.optionPill, { backgroundColor: animationStyle === s ? theme.accent : theme.surfaceLight }]}
              onPress={() => setAnimationStyle(s)}
            >
              <Text style={[styles.optionPillText, { color: animationStyle === s ? '#0A0E1A' : theme.textSecondary }]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notification Sound */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🔔 {t('profile.notification_sound')}</Text>
        <View style={styles.soundGrid}>
          {NOTIFICATION_SOUNDS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.soundPill, { backgroundColor: notifSound === s ? theme.accent : theme.surfaceLight }]}
              onPress={() => setNotifSound(s)}
            >
              <Text style={[styles.soundText, { color: notifSound === s ? '#0A0E1A' : theme.textSecondary }]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Privacy */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🔒 {t('profile.privacy')}</Text>
        {PRIVACY_OPTIONS.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[styles.privacyRow, privacy === p.id && { backgroundColor: theme.accent + '15' }]}
            onPress={() => setPrivacy(p.id)}
          >
            <Text style={styles.privacyIcon}>{p.icon}</Text>
            <Text style={[styles.privacyLabel, { color: privacy === p.id ? theme.accent : theme.text }]}>
              {t(p.labelKey)}
            </Text>
            {privacy === p.id && <Text style={[styles.privacyCheck, { color: theme.accent }]}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  closeBtn: { fontSize: 22, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '900' },
  saveBtn: { fontSize: 16, fontWeight: '700' },
  section: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetItem: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  presetEmoji: { fontSize: 22 },
  bannerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bannerPreview: { width: 56, height: 32, borderRadius: 8 },
  bannerActive: { borderWidth: 2, borderColor: '#FFF' },
  bioInput: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, minHeight: 60, textAlignVertical: 'top' },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 4 },
  moodPresets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  moodPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  moodPillText: { fontSize: 13, fontWeight: '600' },
  moodCustom: { marginTop: 10 },
  moodInput: { height: 40, borderRadius: 10, paddingHorizontal: 14, fontSize: 14 },
  colorInput: { height: 44, borderRadius: 12, paddingHorizontal: 14, fontSize: 16 },
  colorPreview: { width: '100%', height: 32, borderRadius: 8, marginTop: 8 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeItem: { alignItems: 'center', padding: 10, borderRadius: 12, minWidth: 70 },
  badgeEmoji: { fontSize: 24 },
  badgeName: { fontSize: 10, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  noBadges: { fontSize: 14, paddingVertical: 8 },
  optionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  optionItem: { alignItems: 'center', padding: 12, borderRadius: 12, minWidth: 70 },
  optionEmoji: { fontSize: 24 },
  optionLabel: { fontSize: 11, fontWeight: '600', marginTop: 4 },
  optionPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  optionPillText: { fontSize: 14, fontWeight: '600' },
  soundGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  soundPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  soundText: { fontSize: 13, fontWeight: '600' },
  privacyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, gap: 12 },
  privacyIcon: { fontSize: 20 },
  privacyLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  privacyCheck: { fontSize: 18, fontWeight: '700' },
});
