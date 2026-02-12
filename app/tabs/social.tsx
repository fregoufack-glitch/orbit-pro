import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useSocial } from '../../contexts/SocialContext';
import { t } from '../../i18n';
import ProfileAvatarButton, { getAvatarDisplay } from '../../components/ProfileAvatarButton';

const REACTION_EMOJIS = ['🔥', '❤️', '👏', '💪', '🎉'];

export default function SocialScreen() {
  const router = useRouter();
  const { theme, profile, language } = useApp();
  const {
    friends, pendingRequests, feed, friendStoryGroups,
    loadFeed, loadFriends, loadStories,
    addReaction, removeReaction,
  } = useSocial();
  const [refreshing, setRefreshing] = useState(false);
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);

  useEffect(() => {
    loadFeed();
    loadStories();
  }, [friends.length]);

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loadFriends(), loadFeed(), loadStories()]);
    setRefreshing(false);
  }

  function renderFeedContent(item: any) {
    const c = item.content_json || {};
    switch (item.content_type) {
      case 'streak': return `🔥 ${language === 'fr' ? `Série de ${c.days} jours !` : `${c.days}-day streak!`}`;
      case 'level_up': return `⬆️ ${language === 'fr' ? `Niveau ${c.level} atteint !` : `Reached level ${c.level}!`}`;
      case 'perfect_day': return `⭐ ${language === 'fr' ? 'Journée parfaite !' : 'Perfect day!'}`;
      case 'badge': return `🏆 ${language === 'fr' ? 'Badge débloqué :' : 'Badge unlocked:'} ${c.emoji || ''} ${c.name || ''}`;
      case 'achievement': return `🎯 ${c.text || ''}`;
      case 'challenge_complete': return `🏅 ${language === 'fr' ? 'Défi terminé :' : 'Challenge completed:'} ${c.name || ''}`;
      default: return c.text || '';
    }
  }

  function getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return language === 'fr' ? 'maintenant' : 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Social</Text>
        <View style={styles.headerActions}>
          {pendingRequests.length > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.error }]}>
              <Text style={styles.badgeText}>{pendingRequests.length}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => router.push('/social/friends')}>
            <Text style={[styles.headerBtn, { color: theme.accent }]}>👥</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/social/challenges')}>
            <Text style={[styles.headerBtn, { color: theme.accent }]}>🏆</Text>
          </TouchableOpacity>
          <ProfileAvatarButton size={36} />
        </View>
      </View>

      {/* Stories Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesBar} contentContainerStyle={styles.storiesContent}>
        {/* My Story */}
        <TouchableOpacity style={styles.storyItem} onPress={() => router.push('/social/stories?mode=post')}>
          <View style={[styles.storyAvatar, { borderColor: theme.border }]}>
            <Text style={styles.storyAvatarText}>+</Text>
          </View>
          <Text style={[styles.storyName, { color: theme.textMuted }]}>{language === 'fr' ? 'Ma story' : 'My story'}</Text>
        </TouchableOpacity>

        {friendStoryGroups.map(group => {
          const avatar = getAvatarDisplay(group.user);
          return (
            <TouchableOpacity
              key={group.userId}
              style={styles.storyItem}
              onPress={() => router.push(`/social/stories?userId=${group.userId}`)}
            >
              <View style={[styles.storyAvatar, { borderColor: group.hasNew ? theme.accent : theme.border, borderWidth: group.hasNew ? 3 : 2 }]}>
                <Text style={styles.storyAvatarText}>
                  {avatar.type === 'preset' ? avatar.value : avatar.type === 'letter' ? avatar.value : '👤'}
                </Text>
              </View>
              <Text style={[styles.storyName, { color: group.hasNew ? theme.text : theme.textMuted }]} numberOfLines={1}>
                {group.user.pseudo}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Conversations shortcut */}
      <TouchableOpacity
        style={[styles.conversationsPeek, { backgroundColor: theme.surface }]}
        onPress={() => router.push('/social/conversations')}
      >
        <Text style={styles.conversationsEmoji}>💬</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.conversationsText, { color: theme.text }]}>
            {language === 'fr' ? 'Messages' : 'Messages'}
          </Text>
          <Text style={[styles.conversationsSub, { color: theme.textMuted }]}>
            {language === 'fr' ? 'DMs & groupes' : 'DMs & groups'}
          </Text>
        </View>
        <Text style={[styles.conversationsArrow, { color: theme.textMuted }]}>›</Text>
      </TouchableOpacity>

      {/* Leaderboard peek */}
      <TouchableOpacity
        style={[styles.leaderboardPeek, { backgroundColor: theme.surface }]}
        onPress={() => router.push('/social/friends?tab=leaderboard')}
      >
        <Text style={styles.leaderboardEmoji}>🏆</Text>
        <Text style={[styles.leaderboardText, { color: theme.text }]}>
          {language === 'fr' ? 'Classement entre amis' : 'Friends Leaderboard'}
        </Text>
        <Text style={[styles.leaderboardArrow, { color: theme.textMuted }]}>›</Text>
      </TouchableOpacity>

      {/* Feed */}
      {feed.length === 0 ? (
        <View style={styles.emptyFeed}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {language === 'fr' ? 'Ajoutez des amis pour voir leur activité !' : 'Add friends to see their activity!'}
          </Text>
          <TouchableOpacity
            style={[styles.addFriendsBtn, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/social/friends')}
          >
            <Text style={styles.addFriendsBtnText}>
              {language === 'fr' ? 'Trouver des amis' : 'Find friends'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        feed.map(item => {
          const avatar = item.user ? getAvatarDisplay(item.user) : { type: 'letter' as const, value: '?' };
          const myReaction = item.reactions?.find(r => r.user_id === profile?.id);

          return (
            <View key={item.id} style={[styles.feedCard, { backgroundColor: theme.surface }]}>
              <View style={styles.feedHeader}>
                <TouchableOpacity
                  style={styles.feedUserRow}
                  onPress={() => item.user && router.push(`/social/profile-view?userId=${item.user_id}`)}
                >
                  <View style={[styles.feedAvatar, { backgroundColor: (item.user?.accent_color || theme.accent) + '30' }]}>
                    <Text style={{ fontSize: 18 }}>
                      {avatar.type === 'preset' ? avatar.value : avatar.value}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.feedUsername, { color: theme.text }]}>{item.user?.pseudo || '?'}</Text>
                    <Text style={[styles.feedTime, { color: theme.textMuted }]}>{getTimeAgo(item.created_at)}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={[styles.feedContent, { color: theme.text }]}>
                {renderFeedContent(item)}
              </Text>

              {/* Reactions */}
              <View style={styles.reactionsRow}>
                {item.reactions && item.reactions.length > 0 && (
                  <View style={[styles.reactionCounts, { backgroundColor: theme.surfaceLight }]}>
                    {[...new Set(item.reactions.map(r => r.emoji))].map(emoji => {
                      const count = item.reactions!.filter(r => r.emoji === emoji).length;
                      return (
                        <Text key={emoji} style={[styles.reactionCount, { color: theme.textSecondary }]}>
                          {emoji} {count}
                        </Text>
                      );
                    })}
                  </View>
                )}

                <TouchableOpacity onPress={() => setShowReactionsFor(showReactionsFor === item.id ? null : item.id)}>
                  <Text style={{ fontSize: 20 }}>{myReaction ? myReaction.emoji : '😀'}</Text>
                </TouchableOpacity>
              </View>

              {showReactionsFor === item.id && (
                <View style={[styles.reactionPicker, { backgroundColor: theme.surfaceLight }]}>
                  {REACTION_EMOJIS.map(emoji => (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => {
                        if (myReaction?.emoji === emoji) removeReaction('feed', item.id);
                        else addReaction('feed', item.id, emoji);
                        setShowReactionsFor(null);
                      }}
                    >
                      <Text style={[styles.reactionOption, myReaction?.emoji === emoji && { transform: [{ scale: 1.3 }] }]}>
                        {emoji}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { fontSize: 24 },
  badge: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    position: 'absolute', top: -8, right: -8, zIndex: 1,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },

  // Stories
  storiesBar: { marginTop: 8, maxHeight: 100 },
  storiesContent: { paddingHorizontal: 16, gap: 12 },
  storyItem: { alignItems: 'center', width: 64 },
  storyAvatar: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#141929',
  },
  storyAvatarText: { fontSize: 24 },
  storyName: { fontSize: 11, marginTop: 4, fontWeight: '500' },

  // Conversations
  conversationsPeek: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 12, borderRadius: 14,
    padding: 14, gap: 10,
  },
  conversationsEmoji: { fontSize: 22 },
  conversationsText: { fontSize: 15, fontWeight: '600' },
  conversationsSub: { fontSize: 12, marginTop: 1 },
  conversationsArrow: { fontSize: 22 },

  // Leaderboard
  leaderboardPeek: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 12, borderRadius: 14,
    padding: 14, gap: 10,
  },
  leaderboardEmoji: { fontSize: 22 },
  leaderboardText: { flex: 1, fontSize: 15, fontWeight: '600' },
  leaderboardArrow: { fontSize: 22 },

  // Empty state
  emptyFeed: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  addFriendsBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  addFriendsBtnText: { color: '#0A0E1A', fontSize: 15, fontWeight: '700' },

  // Feed
  feedCard: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16 },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  feedUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  feedUsername: { fontSize: 15, fontWeight: '700' },
  feedTime: { fontSize: 12 },
  feedContent: { fontSize: 16, lineHeight: 24, marginBottom: 10 },

  // Reactions
  reactionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reactionCounts: { flexDirection: 'row', gap: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  reactionCount: { fontSize: 13 },
  reactionPicker: { flexDirection: 'row', gap: 12, padding: 10, borderRadius: 16, marginTop: 8, justifyContent: 'center' },
  reactionOption: { fontSize: 24 },
});
