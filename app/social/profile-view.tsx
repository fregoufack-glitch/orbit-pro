import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useSocial, FriendProfile } from '../../contexts/SocialContext';
import { getAvatarDisplay } from '../../components/ProfileAvatarButton';
import { getLevelForXP } from '../../constants/theme';
import { t } from '../../i18n';

const PROFILE_THEMES: Record<string, { bg: string; accent: string }> = {
  neon_green: { bg: '#0A1A14', accent: '#00D9A5' },
  purple_galaxy: { bg: '#120A1A', accent: '#A78BFA' },
  sunset_coral: { bg: '#1A0F0A', accent: '#FB923C' },
  ocean_blue: { bg: '#0A0F1A', accent: '#60A5FA' },
  fire_red: { bg: '#1A0A0A', accent: '#FF6B6B' },
  pink_dream: { bg: '#1A0A14', accent: '#F472B6' },
  gold: { bg: '#1A170A', accent: '#FFE66D' },
  teal: { bg: '#0A1A18', accent: '#4ECDC4' },
};

const BANNER_GRADIENTS: Record<string, string[]> = {
  aurora: ['#00D9A5', '#A78BFA'],
  sunset: ['#FF6B6B', '#FB923C'],
  ocean: ['#60A5FA', '#4ECDC4'],
  fire: ['#FF6B6B', '#FFE66D'],
  galaxy: ['#A78BFA', '#F472B6'],
  forest: ['#00D9A5', '#34D399'],
  midnight: ['#1E293B', '#60A5FA'],
  rose: ['#F472B6', '#FFE66D'],
};

const STREAK_ICONS: Record<string, string> = {
  flame: '🔥', lightning: '⚡', star: '⭐', diamond: '💎',
};

export default function ProfileViewScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { theme, profile: myProfile, language } = useApp();
  const { loadUserProfile, loadUserBadges, getMutualFriendsCount, friends, sendFriendRequest } = useSocial();

  const [userProfile, setUserProfile] = useState<FriendProfile | null>(null);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [mutualCount, setMutualCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isFriend = friends.some(f =>
    ((f as any).friend?.id === userId)
  );
  const isMe = userId === myProfile?.id;

  useEffect(() => {
    if (userId) {
      Promise.all([
        loadUserProfile(userId).then(setUserProfile),
        loadUserBadges(userId).then(setUserBadges),
        getMutualFriendsCount(userId).then(setMutualCount),
      ]).finally(() => setLoading(false));
    }
  }, [userId]);

  if (loading || !userProfile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  const avatar = getAvatarDisplay(userProfile);
  const levelInfo = getLevelForXP(userProfile.xp || 0);
  const profileTheme = PROFILE_THEMES[userProfile.profile_theme || 'neon_green'] || PROFILE_THEMES.neon_green;
  const streakIcon = STREAK_ICONS[userProfile.streak_style || 'flame'];
  const showcase = Array.isArray(userProfile.badge_showcase) ? userProfile.badge_showcase : [];
  const bannerColors = BANNER_GRADIENTS[userProfile.banner_gradient || 'aurora'] || BANNER_GRADIENTS.aurora;

  return (
    <ScrollView style={[styles.container, { backgroundColor: profileTheme.bg }]}>
      {/* Close */}
      <TouchableOpacity style={styles.closeWrap} onPress={() => router.back()}>
        <Text style={styles.closeBtn}>✕</Text>
      </TouchableOpacity>

      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: profileTheme.accent + '30' }]}>
        <View style={[styles.bannerGradient, { backgroundColor: bannerColors[0] + '40' }]} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatarCircle, { backgroundColor: profileTheme.accent + '30', borderColor: profileTheme.accent }]}>
          <Text style={{ fontSize: 48 }}>
            {avatar.type === 'preset' ? avatar.value : avatar.type === 'image' ? '👤' : avatar.value}
          </Text>
        </View>
      </View>

      {/* Name & Mood */}
      <View style={styles.nameSection}>
        <Text style={[
          styles.displayName,
          { color: '#FFF' },
          userProfile.display_name_style === 'bold' && { fontWeight: '900' },
          userProfile.display_name_style === 'italic' && { fontStyle: 'italic' },
        ]}>
          {userProfile.pseudo}
        </Text>
        {userProfile.custom_title ? (
          <Text style={[styles.customTitle, { color: profileTheme.accent }]}>{userProfile.custom_title}</Text>
        ) : null}
        {userProfile.mood_emoji ? (
          <View style={[styles.moodPill, { backgroundColor: profileTheme.accent + '20' }]}>
            <Text style={styles.moodText}>{userProfile.mood_emoji} {userProfile.mood_text}</Text>
          </View>
        ) : null}
        {userProfile.bio ? (
          <Text style={styles.bio}>{userProfile.bio}</Text>
        ) : null}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={{ fontSize: 20 }}>{streakIcon}</Text>
          <Text style={[styles.statValue, { color: profileTheme.accent }]}>{userProfile.streak_days}</Text>
          <Text style={styles.statLabel}>{language === 'fr' ? 'Série' : 'Streak'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={{ fontSize: 20 }}>⚡</Text>
          <Text style={[styles.statValue, { color: '#FFE66D' }]}>{userProfile.xp}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={{ fontSize: 20 }}>📊</Text>
          <Text style={[styles.statValue, { color: '#60A5FA' }]}>{userProfile.level}</Text>
          <Text style={styles.statLabel}>{language === 'fr' ? 'Niveau' : 'Level'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={{ fontSize: 20 }}>🏆</Text>
          <Text style={[styles.statValue, { color: '#FB923C' }]}>{userProfile.longest_streak}</Text>
          <Text style={styles.statLabel}>{language === 'fr' ? 'Record' : 'Best'}</Text>
        </View>
      </View>

      {/* Level */}
      <View style={[styles.card, { backgroundColor: '#FFF1' }]}>
        <Text style={[styles.levelText, { color: profileTheme.accent }]}>{t(levelInfo.name)}</Text>
        <View style={[styles.xpBar, { backgroundColor: '#FFF1' }]}>
          <View style={[styles.xpFill, { backgroundColor: profileTheme.accent, width: `${levelInfo.xpForNext > 0 ? (levelInfo.xpProgress / levelInfo.xpForNext) * 100 : 100}%` }]} />
        </View>
      </View>

      {/* Badge Showcase */}
      {showcase.length > 0 && (
        <View style={[styles.card, { backgroundColor: '#FFF1' }]}>
          <Text style={styles.cardTitle}>{language === 'fr' ? '🏅 Vitrine' : '🏅 Showcase'}</Text>
          <View style={styles.showcaseRow}>
            {showcase.slice(0, 3).map((badgeId: string, i: number) => {
              const badge = userBadges.find(b => b.badge_id === badgeId);
              return badge ? (
                <View key={i} style={styles.showcaseBadge}>
                  <Text style={{ fontSize: 36 }}>{badge.badge_emoji}</Text>
                  <Text style={styles.showcaseName}>{badge.badge_name}</Text>
                </View>
              ) : null;
            })}
          </View>
        </View>
      )}

      {/* All Badges */}
      {userBadges.length > 0 && (
        <View style={[styles.card, { backgroundColor: '#FFF1' }]}>
          <Text style={styles.cardTitle}>{language === 'fr' ? '🏆 Badges' : '🏆 Badges'} ({userBadges.length})</Text>
          <View style={styles.badgeGrid}>
            {userBadges.map(b => (
              <View key={b.id} style={styles.badgeItem}>
                <Text style={{ fontSize: 28 }}>{b.badge_emoji}</Text>
                <Text style={styles.badgeName}>{b.badge_name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Mutual Friends */}
      {!isMe && mutualCount > 0 && (
        <View style={[styles.card, { backgroundColor: '#FFF1' }]}>
          <Text style={styles.cardTitle}>
            👥 {mutualCount} {language === 'fr' ? 'amis en commun' : 'mutual friends'}
          </Text>
        </View>
      )}

      {/* Actions */}
      {!isMe && (
        <View style={styles.actionRow}>
          {!isFriend ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: profileTheme.accent }]}
              onPress={async () => {
                await sendFriendRequest(userProfile.pseudo);
              }}
            >
              <Text style={styles.actionBtnText}>{language === 'fr' ? '➕ Ajouter' : '➕ Add Friend'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: profileTheme.accent }]}
              onPress={() => router.push(`/social/chat?friendId=${userId}`)}
            >
              <Text style={styles.actionBtnText}>💬 {language === 'fr' ? 'Message' : 'Message'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeWrap: { position: 'absolute', top: 56, left: 20, zIndex: 10 },
  closeBtn: { color: '#FFF', fontSize: 22, fontWeight: '600', textShadowColor: '#000', textShadowRadius: 4 },
  banner: { height: 160 },
  bannerGradient: { flex: 1 },
  avatarSection: { alignItems: 'center', marginTop: -50 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  nameSection: { alignItems: 'center', paddingHorizontal: 20, marginTop: 12 },
  displayName: { fontSize: 26, fontWeight: '700' },
  customTitle: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  moodPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  moodText: { color: '#FFF', fontSize: 14 },
  bio: { color: '#FFF9', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginTop: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', marginTop: 2 },
  statLabel: { color: '#FFF6', fontSize: 11, marginTop: 2 },
  card: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16 },
  cardTitle: { color: '#FFFC', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  levelText: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  xpBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4 },
  showcaseRow: { flexDirection: 'row', justifyContent: 'space-around' },
  showcaseBadge: { alignItems: 'center' },
  showcaseName: { color: '#FFFA', fontSize: 12, fontWeight: '600', marginTop: 4 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeItem: { alignItems: 'center', width: '28%' },
  badgeName: { color: '#FFF9', fontSize: 11, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 20, gap: 12 },
  actionBtn: { flex: 1, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#0A0E1A', fontSize: 16, fontWeight: '700' },
});
