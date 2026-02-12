import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useSocial, FriendProfile, Message } from '../../contexts/SocialContext';
import { getAvatarDisplay } from '../../components/ProfileAvatarButton';

export default function DMScreen() {
  const router = useRouter();
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const { theme, profile, language } = useApp();
  const { loadDMMessages, sendDM, markDMRead, sendTypingIndicator, typingUsers, loadUserProfile, isFriend, friends } = useSocial();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [friend, setFriend] = useState<FriendProfile | null>(null);
  const [expireMode, setExpireMode] = useState<'24h' | 'viewed' | 'keep'>('24h');
  const [notFriend, setNotFriend] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  const friendship = friends.find(f =>
    (f as any).friend?.id === friendId
  );
  const friendStreak = friendship?.friend_streak || 0;

  useEffect(() => {
    if (!friendId) return;

    // Check friendship
    if (!isFriend(friendId)) {
      setNotFriend(true);
      loadUserProfile(friendId).then(setFriend);
      return;
    }

    loadUserProfile(friendId).then(setFriend);
    refreshMessages();
    const interval = setInterval(refreshMessages, 4000);
    return () => clearInterval(interval);
  }, [friendId]);

  async function refreshMessages() {
    if (!friendId) return;
    const msgs = await loadDMMessages(friendId);
    setMessages(msgs);
    for (const msg of msgs) {
      if (!msg.is_read && msg.receiver_id === profile?.id) {
        markDMRead(msg.id);
      }
    }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }

  function handleTyping(text: string) {
    setInput(text);
    if (friendId) {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      sendTypingIndicator(friendId);
      typingTimeout.current = setTimeout(() => {}, 3000);
    }
  }

  async function handleSend() {
    if (!input.trim() || !friendId) return;
    const result = await sendDM(friendId, input.trim(), 'text', undefined, expireMode);
    if (result.error) {
      Alert.alert(language === 'fr' ? 'Erreur' : 'Error', result.error);
      return;
    }
    setInput('');
    await refreshMessages();
  }

  async function handleShareAchievement() {
    if (!friendId || !profile) return;
    const text = language === 'fr'
      ? `🏆 J'ai ${profile.xp} XP et une série de ${profile.streak_days} jours !`
      : `🏆 I have ${profile.xp} XP and a ${profile.streak_days}-day streak!`;
    await sendDM(friendId, text, 'achievement_share', undefined, 'keep');
    await refreshMessages();
  }

  const friendAvatar = friend ? getAvatarDisplay(friend) : { type: 'letter' as const, value: '?' };
  const isTyping = typingUsers.has(friendId || '');

  // NOT FRIEND - Block DM
  if (notFriend) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backBtn, { color: theme.textSecondary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerName, { color: theme.text }]}>{friend?.pseudo || '...'}</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.blockedState}>
          <Text style={styles.blockedEmoji}>🔒</Text>
          <Text style={[styles.blockedTitle, { color: theme.text }]}>
            {language === 'fr' ? 'DM non disponible' : 'DM unavailable'}
          </Text>
          <Text style={[styles.blockedText, { color: theme.textSecondary }]}>
            {language === 'fr'
              ? 'Vous devez être amis pour envoyer des messages directs. Envoyez d\'abord une demande d\'ami.'
              : 'You must be friends to send direct messages. Send a friend request first.'}
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.accent }]}
            onPress={() => router.push(`/social/profile-view?userId=${friendId}`)}
          >
            <Text style={styles.addBtnText}>
              {language === 'fr' ? 'Voir le profil' : 'View Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backBtn, { color: theme.textSecondary }]}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerCenter}
          onPress={() => friend && router.push(`/social/profile-view?userId=${friend.id}`)}
        >
          <View style={[styles.headerAvatar, { backgroundColor: (friend?.accent_color || theme.accent) + '30' }]}>
            <Text style={{ fontSize: 18 }}>{friendAvatar.type === 'preset' ? friendAvatar.value : friendAvatar.value}</Text>
          </View>
          <View>
            <Text style={[styles.headerName, { color: theme.text }]}>{friend?.pseudo || '...'}</Text>
            {isTyping && (
              <Text style={[styles.typingText, { color: theme.accent }]}>
                {language === 'fr' ? 'écrit...' : 'typing...'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        {friendStreak > 0 && (
          <View style={styles.streakBadge}>
            <Text style={{ fontSize: 14 }}>🔥</Text>
            <Text style={[styles.streakNum, { color: '#FF6B6B' }]}>{friendStreak}</Text>
          </View>
        )}
      </View>

      {/* Expire mode */}
      <View style={[styles.expireRow, { backgroundColor: theme.surface }]}>
        {(['viewed', '24h', 'keep'] as const).map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.expireBtn, expireMode === mode && { backgroundColor: theme.accent + '20' }]}
            onPress={() => setExpireMode(mode)}
          >
            <Text style={[styles.expireText, { color: expireMode === mode ? theme.accent : theme.textMuted }]}>
              {mode === 'viewed' ? '👁️' : mode === '24h' ? '⏰' : '💾'}{' '}
              {mode === 'viewed' ? (language === 'fr' ? 'Vu' : 'Viewed') :
               mode === '24h' ? '24h' : (language === 'fr' ? 'Garder' : 'Keep')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} style={styles.messageList} contentContainerStyle={styles.messageContent}>
        {messages.map(msg => {
          const isMine = msg.sender_id === profile?.id;
          const isExpired = msg.expires_at && new Date(msg.expires_at) < new Date() && msg.expire_mode !== 'keep';

          if (isExpired) {
            return (
              <View key={msg.id} style={[styles.expiredMsg, { alignSelf: isMine ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.expiredText, { color: theme.textMuted }]}>
                  💨 {language === 'fr' ? 'Expiré' : 'Expired'}
                </Text>
              </View>
            );
          }

          return (
            <View
              key={msg.id}
              style={[
                styles.bubble,
                isMine ? styles.myBubble : styles.theirBubble,
                { backgroundColor: isMine ? theme.accent + '20' : theme.surface, borderColor: isMine ? theme.accent + '40' : theme.border },
              ]}
            >
              {msg.message_type === 'achievement_share' && <Text style={{ fontSize: 20, marginBottom: 4 }}>🏆</Text>}
              {msg.message_type === 'challenge' && <Text style={{ fontSize: 20, marginBottom: 4 }}>🎯</Text>}
              {msg.message_type === 'snap' && <Text style={{ fontSize: 20, marginBottom: 4 }}>📸</Text>}
              <Text style={[styles.bubbleText, { color: theme.text }]}>{msg.content}</Text>
              <View style={styles.msgMeta}>
                <Text style={[styles.msgTime, { color: theme.textMuted }]}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {msg.expire_mode !== 'keep' && <Text style={{ fontSize: 10 }}>💨</Text>}
                {isMine && msg.is_read && <View style={[styles.readDot, { backgroundColor: theme.accent }]} />}
              </View>
            </View>
          );
        })}

        {isTyping && (
          <View style={[styles.bubble, styles.theirBubble, { backgroundColor: theme.surface }]}>
            <Text style={[styles.typingDots, { color: theme.textMuted }]}>• • •</Text>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputRow, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={handleShareAchievement}>
          <Text style={{ fontSize: 22 }}>🏆</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={input}
          onChangeText={handleTyping}
          placeholder={language === 'fr' ? 'Message...' : 'Message...'}
          placeholderTextColor={theme.textMuted}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.accent }]} onPress={handleSend}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, gap: 12 },
  backBtn: { fontSize: 32, fontWeight: '600' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerName: { fontSize: 17, fontWeight: '700' },
  typingText: { fontSize: 12, fontWeight: '500' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  streakNum: { fontSize: 16, fontWeight: '800' },
  expireRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  expireBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  expireText: { fontSize: 12, fontWeight: '600' },
  messageList: { flex: 1 },
  messageContent: { padding: 16, gap: 6 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 18, borderWidth: 1 },
  myBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  msgMeta: { flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center' },
  msgTime: { fontSize: 11 },
  readDot: { width: 8, height: 8, borderRadius: 4 },
  typingDots: { fontSize: 20, letterSpacing: 4 },
  expiredMsg: { padding: 8, opacity: 0.5 },
  expiredText: { fontSize: 13, fontStyle: 'italic' },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, paddingBottom: 30, alignItems: 'center' },
  input: { flex: 1, height: 44, paddingHorizontal: 16, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#0A0E1A', fontSize: 18, fontWeight: '700' },
  // Blocked state
  blockedState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  blockedEmoji: { fontSize: 56, marginBottom: 16 },
  blockedTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  blockedText: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  addBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  addBtnText: { color: '#0A0E1A', fontSize: 16, fontWeight: '700' },
});
