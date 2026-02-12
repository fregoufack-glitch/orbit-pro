import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import { ACCENT_COLORS, getLevelForXP } from '../../constants/theme';
import XPBar from '../../components/XPBar';
import StreakFlame from '../../components/StreakFlame';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    profile, theme, themeMode, accentColor, language,
    setThemeMode, setAccentColor, changeLanguage, updateProfile,
    signOut, deleteAccount, habits, todayCompletions,
  } = useApp();

  const [customTitle, setCustomTitle] = useState(profile?.custom_title || '');
  const [editingTitle, setEditingTitle] = useState(false);

  const levelInfo = getLevelForXP(profile?.xp || 0);

  async function handleExportCSV() {
    const header = 'Habit,Category,Completed Today\n';
    const rows = habits.map(h => {
      const completed = todayCompletions.some(c => c.habit_id === h.id);
      return `${h.name},${h.category},${completed}`;
    }).join('\n');
    const csv = header + rows;
    Alert.alert(t('profile.export_csv'), csv.substring(0, 500) + (csv.length > 500 ? '...' : ''));
  }

  function handleDeleteAccount() {
    Alert.alert(
      t('profile.delete_account'),
      t('profile.delete_confirm'),
      [
        { text: t('common.cancel') },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
            router.replace('/auth/login');
          },
        },
      ]
    );
  }

  async function saveTitle() {
    await updateProfile({ custom_title: customTitle });
    setEditingTitle(false);
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t('profile.title')}</Text>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: theme.surface }]}>
        <View style={styles.profileTop}>
          <View style={[styles.avatar, { backgroundColor: theme.accent + '30' }]}>
            <Text style={styles.avatarText}>{(profile?.pseudo || 'U')[0].toUpperCase()}</Text>
          </View>
          <StreakFlame size="small" />
        </View>
        <Text style={[styles.pseudo, { color: theme.text }]}>{profile?.pseudo}</Text>
        {profile?.mood_emoji ? (
          <Text style={[styles.moodText, { color: theme.textSecondary }]}>
            {profile.mood_emoji} {profile.mood_text}
          </Text>
        ) : null}
        {profile?.bio ? (
          <Text style={[styles.bioText, { color: theme.textMuted }]}>{profile.bio}</Text>
        ) : null}
        {editingTitle ? (
          <View style={styles.titleEditRow}>
            <TextInput
              style={[styles.titleInput, { backgroundColor: theme.surfaceLight, color: theme.text }]}
              value={customTitle}
              onChangeText={setCustomTitle}
              placeholder={t('profile.custom_title')}
              placeholderTextColor={theme.textMuted}
            />
            <TouchableOpacity onPress={saveTitle}>
              <Text style={[styles.titleSave, { color: theme.accent }]}>✓</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingTitle(true)}>
            <Text style={[styles.customTitleText, { color: theme.textSecondary }]}>
              {profile?.custom_title || t('profile.custom_title')} ✏️
            </Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.levelBadge, { color: theme.accent }]}>{t(levelInfo.name)}</Text>
        <XPBar />
      </View>

      {/* Theme */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🎨 {t('profile.theme')}</Text>
        <View style={styles.themeRow}>
          <TouchableOpacity
            style={[styles.themeBtn, themeMode === 'dark' && { backgroundColor: theme.accent }]}
            onPress={() => setThemeMode('dark')}
          >
            <Text style={[styles.themeBtnText, { color: themeMode === 'dark' ? '#0A0E1A' : theme.textSecondary }]}>
              🌙 {t('profile.dark')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeBtn, themeMode === 'light' && { backgroundColor: theme.accent }]}
            onPress={() => setThemeMode('light')}
          >
            <Text style={[styles.themeBtnText, { color: themeMode === 'light' ? '#0A0E1A' : theme.textSecondary }]}>
              ☀️ {t('profile.light')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Accent Color */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🎨 {t('profile.accent_color')}</Text>
        <View style={styles.colorGrid}>
          {ACCENT_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorCircle, { backgroundColor: c }, accentColor === c && styles.colorCircleActive]}
              onPress={() => setAccentColor(c)}
            />
          ))}
        </View>
      </View>

      {/* Language */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🌐 {t('profile.language')}</Text>
        <View style={styles.themeRow}>
          <TouchableOpacity
            style={[styles.themeBtn, language === 'fr' && { backgroundColor: theme.accent }]}
            onPress={() => changeLanguage('fr')}
          >
            <Text style={[styles.themeBtnText, { color: language === 'fr' ? '#0A0E1A' : theme.textSecondary }]}>🇫🇷 Français</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeBtn, language === 'en' && { backgroundColor: theme.accent }]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={[styles.themeBtnText, { color: language === 'en' ? '#0A0E1A' : theme.textSecondary }]}>🇬🇧 English</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/personalization')}>
          <Text style={[styles.actionText, { color: theme.text }]}>✨ {t('profile.personalization')}</Text>
          <Text style={[styles.actionArrow, { color: theme.textMuted }]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/marketplace')}>
          <Text style={[styles.actionText, { color: theme.text }]}>🛒 {t('marketplace.title')}</Text>
          <Text style={[styles.actionArrow, { color: theme.textMuted }]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/support')}>
          <Text style={[styles.actionText, { color: theme.text }]}>💬 {t('support.title')}</Text>
          <Text style={[styles.actionArrow, { color: theme.textMuted }]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={handleExportCSV}>
          <Text style={[styles.actionText, { color: theme.text }]}>📤 {t('profile.export_csv')}</Text>
          <Text style={[styles.actionArrow, { color: theme.textMuted }]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => Linking.openURL('mailto:miguelfreddy65@gmail.com')}>
          <Text style={[styles.actionText, { color: theme.text }]}>✉️ {t('profile.contact')}</Text>
          <Text style={[styles.actionDetail, { color: theme.textMuted }]}>miguelfreddy65@gmail.com</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.actionRow} onPress={() => signOut().then(() => router.replace('/auth/login'))}>
          <Text style={[styles.actionText, { color: '#FF6B6B' }]}>🚪 {t('auth.logout')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={handleDeleteAccount}>
          <Text style={[styles.actionText, { color: '#FF6B6B' }]}>⚠️ {t('profile.delete_account')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: theme.textMuted }]}>{t('profile.version')} 1.0.0</Text>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '900' },
  profileCard: { marginHorizontal: 16, borderRadius: 20, padding: 24, alignItems: 'center', marginTop: 8 },
  profileTop: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#00D9A5' },
  pseudo: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  moodText: { fontSize: 14, marginBottom: 4 },
  bioText: { fontSize: 13, marginBottom: 8, textAlign: 'center', paddingHorizontal: 16 },
  customTitleText: { fontSize: 14, marginBottom: 8 },
  titleEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  titleInput: { height: 36, borderRadius: 8, paddingHorizontal: 12, fontSize: 14, flex: 1 },
  titleSave: { fontSize: 20, fontWeight: '700' },
  levelBadge: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  section: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  themeBtnText: { fontSize: 14, fontWeight: '600' },
  colorGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  colorCircleActive: { borderWidth: 3, borderColor: '#FFF' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#252B3F' },
  actionText: { fontSize: 15, fontWeight: '600' },
  actionArrow: { fontSize: 22 },
  actionDetail: { fontSize: 12 },
  version: { textAlign: 'center', fontSize: 13, marginTop: 20 },
});
