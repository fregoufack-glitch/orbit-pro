import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useSocial, FriendProfile } from '../../contexts/SocialContext';
import { getAvatarDisplay } from '../../components/ProfileAvatarButton';
import { t } from '../../i18n';

export default function FriendsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { theme, profile, language } = useApp();
  const {
    friends, pendingRequests, loadFriends,
    sendFriendRequest, acceptFriendRequest, declineFriendRequest,
    blockUser, removeFriend, searchUsers, loadLeaderboard, sendEncouragement,
  } = useSocial();

  const [tab, setTab] = useState<'friends' | 'requests' | 'search' | 'leaderboard'>(
    (params.tab as any) || 'friends'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [addUsername, setAddUsername] = useState('');
  const [leaderboard, setLeaderboard] = useState<{ user: FriendProfile; xp: number }[]>([]);

  useEffect(() => {
    if (tab === 'leaderboard') {
      loadLeaderboard().then(setLeaderboard);
    }
  }, [tab]);

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (q.length >= 2) {
      const results = await searchUsers(q);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }

  async function handleAddFriend() {
    if (!addUsername.trim()) return;
    const result = await sendFriendRequest(addUsername.trim());
    if (result.error) Alert.alert(t('common.error'), result.error);
    else {
      Alert.alert('✅', language === 'fr' ? 'Demande envoyée !' : 'Request sent!');
      setAddUsername('');
    }
  }

  function renderFriendCard(friendship: any) {
    const friend = friendship.friend as FriendProfile;
    if (!friend) return null;
    const avatar = getAvatarDisplay(friend);
    const isOnline = friend.last_active_date === new Date().toISOString().split('T')[0];

    return (
      <TouchableOpacity
        key={friendship.id}
        style={[styles.friendCard, { backgroundColor: theme.surface }]}
        onPress={() => router.push(`/social/profile-view?userId=${friend.id}`)}
      >
        <View style={styles.friendAvatarWrap}>
          <View style={[styles.friendAvatar, { backgroundColor: (friend.accent_color || theme.accent) + '30' }]}>
            <Text style={{ fontSize: 22 }}>{avatar.type === 'preset' ? avatar.value : avatar.value}</Text>
          </View>
          {isOnline && <View style={[styles.onlineDot, { backgroundColor: theme.accent }]} />}
        </View>
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: theme.text }]}>{friend.pseudo}</Text>
          {friend.mood_emoji && (
            <Text style={[styles.friendMood, { color: theme.textMuted }]}>{friend.mood_emoji} {friend.mood_text}</Text>
          )}
          <Text style={[styles.friendLevel, { color: theme.textSecondary }]}>
            Lv.{friend.level} • {friend.xp} XP
          </Text>
        </View>
        {friendship.friend_streak > 0 && (
          <View style={styles.friendStreak}>
            <Text style={styles.friendStreakEmoji}>🔥</Text>
            <Text style={[styles.friendStreakCount, { color: '#FF6B6B' }]}>{friendship.friend_streak}</Text>
          </View>
        )}
        <View style={styles.friendActions}>
          <TouchableOpacity onPress={() => {
            sendEncouragement(friend.id);
            Alert.alert('👏', t('social.encouraged'));
          }}>
            <Text style={{ fontSize: 20 }}>👏</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/social/chat?friendId=${friend.id}`)}>
            <Text style={{ fontSize: 20 }}>💬</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          {language === 'fr' ? 'Amis' : 'Friends'}
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={styles.tabContent}>
        {(['friends', 'requests', 'search', 'leaderboard'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && { backgroundColor: theme.accent }]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: tab === t ? '#0A0E1A' : theme.textSecondary }]}>
              {t === 'friends' ? `👥 ${friends.length}` :
               t === 'requests' ? `📩 ${pendingRequests.length}` :
               t === 'search' ? '🔍' : '🏆'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {/* Add Friend */}
        {(tab === 'friends' || tab === 'search') && (
          <View style={[styles.addRow, { backgroundColor: theme.surface }]}>
            <TextInput
              style={[styles.addInput, { color: theme.text }]}
              value={tab === 'search' ? searchQuery : addUsername}
              onChangeText={tab === 'search' ? handleSearch : setAddUsername}
              placeholder={tab === 'search'
                ? (language === 'fr' ? 'Rechercher un utilisateur...' : 'Search for a user...')
                : (language === 'fr' ? 'Pseudo de l\'ami' : "Friend's username")}
              placeholderTextColor={theme.textMuted}
            />
            {tab === 'friends' && (
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.accent }]} onPress={handleAddFriend}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Friends List */}
        {tab === 'friends' && (
          friends.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {language === 'fr' ? 'Aucun ami pour le moment' : 'No friends yet'}
              </Text>
            </View>
          ) : friends.map(renderFriendCard)
        )}

        {/* Requests */}
        {tab === 'requests' && (
          pendingRequests.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📩</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {language === 'fr' ? 'Aucune demande en attente' : 'No pending requests'}
              </Text>
            </View>
          ) : pendingRequests.map(req => {
            const friend = (req as any).friend as FriendProfile;
            if (!friend) return null;
            const avatar = getAvatarDisplay(friend);
            return (
              <View key={req.id} style={[styles.requestCard, { backgroundColor: theme.surface }]}>
                <View style={[styles.friendAvatar, { backgroundColor: (friend.accent_color || theme.accent) + '30' }]}>
                  <Text style={{ fontSize: 22 }}>{avatar.type === 'preset' ? avatar.value : avatar.value}</Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={[styles.friendName, { color: theme.text }]}>{friend.pseudo}</Text>
                  <Text style={[styles.friendLevel, { color: theme.textSecondary }]}>Lv.{friend.level}</Text>
                </View>
                <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: theme.accent }]} onPress={() => acceptFriendRequest(req.id)}>
                  <Text style={styles.acceptBtnText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.declineBtn, { borderColor: theme.error }]} onPress={() => declineFriendRequest(req.id)}>
                  <Text style={[styles.declineBtnText, { color: theme.error }]}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Search Results */}
        {tab === 'search' && searchResults.map(user => {
          const avatar = getAvatarDisplay(user);
          const isFriend = friends.some(f => (f as any).friend?.id === user.id);
          return (
            <TouchableOpacity
              key={user.id}
              style={[styles.friendCard, { backgroundColor: theme.surface }]}
              onPress={() => router.push(`/social/profile-view?userId=${user.id}`)}
            >
              <View style={[styles.friendAvatar, { backgroundColor: (user.accent_color || theme.accent) + '30' }]}>
                <Text style={{ fontSize: 22 }}>{avatar.type === 'preset' ? avatar.value : avatar.value}</Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: theme.text }]}>{user.pseudo}</Text>
                <Text style={[styles.friendLevel, { color: theme.textSecondary }]}>Lv.{user.level} • {user.xp} XP</Text>
              </View>
              {isFriend ? (
                <Text style={[styles.friendTag, { color: theme.accent }]}>✓</Text>
              ) : (
                <TouchableOpacity
                  style={[styles.addSmallBtn, { backgroundColor: theme.accent }]}
                  onPress={async () => {
                    const res = await sendFriendRequest(user.pseudo);
                    if (!res.error) Alert.alert('✅', language === 'fr' ? 'Demande envoyée' : 'Request sent');
                  }}
                >
                  <Text style={styles.addSmallBtnText}>+</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Leaderboard */}
        {tab === 'leaderboard' && (
          leaderboard.map((entry, i) => {
            const avatar = getAvatarDisplay(entry.user);
            const isMe = entry.user.id === profile?.id;
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <View key={entry.user.id} style={[styles.leaderRow, { backgroundColor: isMe ? theme.accent + '15' : theme.surface, borderColor: isMe ? theme.accent : 'transparent' }]}>
                <Text style={[styles.leaderRank, { color: i < 3 ? theme.accent : theme.textMuted }]}>
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </Text>
                <View style={[styles.friendAvatar, { backgroundColor: (entry.user.accent_color || theme.accent) + '30' }]}>
                  <Text style={{ fontSize: 18 }}>{avatar.type === 'preset' ? avatar.value : avatar.value}</Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={[styles.friendName, { color: theme.text }]}>
                    {entry.user.pseudo} {isMe ? '(you)' : ''}
                  </Text>
                  <Text style={[styles.friendLevel, { color: theme.textSecondary }]}>Lv.{entry.user.level}</Text>
                </View>
                <Text style={[styles.leaderXP, { color: theme.accent }]}>{entry.xp} XP</Text>
              </View>
            );
          })
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
  title: { fontSize: 24, fontWeight: '900' },
  tabRow: { maxHeight: 44, marginBottom: 12 },
  tabContent: { paddingHorizontal: 16, gap: 8 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 14, fontWeight: '600' },
  content: { flex: 1 },
  addRow: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 14, padding: 8, marginBottom: 12, gap: 8 },
  addInput: { flex: 1, height: 40, paddingHorizontal: 12, fontSize: 15 },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#0A0E1A', fontSize: 22, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16 },
  friendCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, gap: 12 },
  friendAvatarWrap: { position: 'relative' },
  friendAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { width: 12, height: 12, borderRadius: 6, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#141929' },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '700' },
  friendMood: { fontSize: 12, marginTop: 1 },
  friendLevel: { fontSize: 12, marginTop: 2 },
  friendStreak: { alignItems: 'center' },
  friendStreakEmoji: { fontSize: 18 },
  friendStreakCount: { fontSize: 14, fontWeight: '800' },
  friendActions: { gap: 8 },
  friendTag: { fontSize: 18, fontWeight: '700' },
  addSmallBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addSmallBtnText: { color: '#0A0E1A', fontSize: 20, fontWeight: '700' },
  requestCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, gap: 12 },
  acceptBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  acceptBtnText: { color: '#0A0E1A', fontSize: 20, fontWeight: '700' },
  declineBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  declineBtnText: { fontSize: 18, fontWeight: '700' },
  leaderRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, gap: 10, borderWidth: 1 },
  leaderRank: { fontSize: 18, fontWeight: '800', width: 36, textAlign: 'center' },
  leaderXP: { fontSize: 16, fontWeight: '800' },
});
