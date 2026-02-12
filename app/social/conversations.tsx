import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useSocial, Conversation } from '../../contexts/SocialContext';
import { getAvatarDisplay } from '../../components/ProfileAvatarButton';

export default function ConversationsScreen() {
  const router = useRouter();
  const { theme, language } = useApp();
  const { conversations, loadConversations, friends } = useSocial();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadConversations(); }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }

  function getTimeLabel(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  function openConversation(conv: Conversation) {
    if (conv.type === 'dm') {
      router.push(`/social/dm?friendId=${conv.id}`);
    } else {
      router.push(`/social/group-chat?groupId=${conv.id}`);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          {language === 'fr' ? '💬 Messages' : '💬 Messages'}
        </Text>
        <TouchableOpacity onPress={() => router.push('/social/create-group')}>
          <Text style={[styles.newBtn, { color: theme.accent }]}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        {conversations.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {language === 'fr' ? 'Aucune conversation' : 'No conversations'}
            </Text>
            <Text style={[styles.emptyHint, { color: theme.textMuted }]}>
              {language === 'fr'
                ? 'Ajoutez des amis et commencez à discuter !'
                : 'Add friends and start chatting!'}
            </Text>
          </View>
        ) : (
          conversations.map(conv => {
            const avatarData = conv.avatar ? getAvatarDisplay(conv.avatar) : null;

            return (
              <TouchableOpacity
                key={`${conv.type}-${conv.id}`}
                style={[styles.convRow, { backgroundColor: theme.surface }]}
                onPress={() => openConversation(conv)}
                activeOpacity={0.7}
              >
                {/* Avatar */}
                <View style={[styles.convAvatar, { backgroundColor: (conv.avatar?.accent_color || theme.accent) + '30' }]}>
                  {conv.type === 'group' ? (
                    <Text style={{ fontSize: 22 }}>{conv.emoji || '👥'}</Text>
                  ) : avatarData ? (
                    <Text style={{ fontSize: 22 }}>
                      {avatarData.type === 'preset' ? avatarData.value : avatarData.value}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 22 }}>👤</Text>
                  )}
                </View>

                {/* Info */}
                <View style={styles.convInfo}>
                  <View style={styles.convTopRow}>
                    <Text style={[styles.convName, { color: theme.text }]} numberOfLines={1}>
                      {conv.type === 'group' ? `${conv.emoji} ${conv.name}` : conv.name}
                    </Text>
                    <Text style={[styles.convTime, { color: theme.textMuted }]}>
                      {getTimeLabel(conv.lastMessageTime)}
                    </Text>
                  </View>
                  <View style={styles.convBottomRow}>
                    <Text style={[styles.convPreview, { color: conv.unread > 0 ? theme.text : theme.textMuted }]} numberOfLines={1}>
                      {conv.lastMessage || (language === 'fr' ? 'Nouvelle conversation' : 'New conversation')}
                    </Text>
                    {conv.unread > 0 && (
                      <View style={[styles.unreadBadge, { backgroundColor: theme.accent }]}>
                        <Text style={styles.unreadText}>{conv.unread}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Friend streak for DMs */}
                {conv.type === 'dm' && (conv.friendStreak || 0) > 0 && (
                  <View style={styles.streakPill}>
                    <Text style={{ fontSize: 12 }}>🔥</Text>
                    <Text style={[styles.streakNum, { color: '#FF6B6B' }]}>{conv.friendStreak}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        {/* New DM shortcut */}
        {friends.length > 0 && (
          <View style={styles.quickDMSection}>
            <Text style={[styles.quickDMTitle, { color: theme.textSecondary }]}>
              {language === 'fr' ? 'Démarrer un DM' : 'Start a DM'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {friends.map(f => {
                const friend = (f as any).friend;
                if (!friend) return null;
                const av = getAvatarDisplay(friend);
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={styles.quickDMItem}
                    onPress={() => router.push(`/social/dm?friendId=${friend.id}`)}
                  >
                    <View style={[styles.quickDMAvatar, { backgroundColor: (friend.accent_color || theme.accent) + '30' }]}>
                      <Text style={{ fontSize: 18 }}>{av.type === 'preset' ? av.value : av.value}</Text>
                    </View>
                    <Text style={[styles.quickDMName, { color: theme.textMuted }]} numberOfLines={1}>
                      {friend.pseudo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  closeBtn: { fontSize: 22, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '900' },
  newBtn: { fontSize: 28, fontWeight: '700' },
  list: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptyHint: { fontSize: 14, marginTop: 4 },
  convRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginBottom: 4, borderRadius: 16, padding: 14, gap: 12 },
  convAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  convInfo: { flex: 1 },
  convTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convName: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  convTime: { fontSize: 12 },
  convBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 },
  convPreview: { fontSize: 13, flex: 1, marginRight: 8 },
  unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#0A0E1A', fontSize: 12, fontWeight: '800' },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  streakNum: { fontSize: 14, fontWeight: '800' },
  quickDMSection: { paddingHorizontal: 16, marginTop: 20 },
  quickDMTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  quickDMItem: { alignItems: 'center', marginRight: 16, width: 56 },
  quickDMAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  quickDMName: { fontSize: 11, marginTop: 4 },
});
