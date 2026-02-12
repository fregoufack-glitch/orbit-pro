import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useSocial, Group, GroupMessage } from '../../contexts/SocialContext';
import { getAvatarDisplay } from '../../components/ProfileAvatarButton';

export default function GroupChatScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { theme, profile, language } = useApp();
  const { groups, loadGroupMessages, sendGroupMessage, markGroupRead, sendTypingIndicator, typingUsers } = useSocial();

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  const group = groups.find(g => g.id === groupId);

  useEffect(() => {
    if (!groupId) return;
    refreshMessages();
    markGroupRead(groupId);
    const interval = setInterval(refreshMessages, 4000);
    return () => clearInterval(interval);
  }, [groupId]);

  async function refreshMessages() {
    if (!groupId) return;
    const msgs = await loadGroupMessages(groupId);
    setMessages(msgs);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }

  function handleTyping(text: string) {
    setInput(text);
    if (groupId) {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      sendTypingIndicator(groupId, true);
      typingTimeout.current = setTimeout(() => {}, 3000);
    }
  }

  async function handleSend() {
    if (!input.trim() || !groupId) return;
    await sendGroupMessage(groupId, input.trim());
    setInput('');
    await refreshMessages();
  }

  async function shareAchievement() {
    if (!groupId || !profile) return;
    const text = language === 'fr'
      ? `🏆 ${profile.pseudo} a ${profile.xp} XP et une série de ${profile.streak_days} jours !`
      : `🏆 ${profile.pseudo} has ${profile.xp} XP and a ${profile.streak_days}-day streak!`;
    await sendGroupMessage(groupId, text, 'achievement');
    await refreshMessages();
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
          onPress={() => groupId && router.push(`/social/group-info?groupId=${groupId}`)}
        >
          <View style={[styles.groupIcon, { backgroundColor: theme.accent + '20' }]}>
            <Text style={{ fontSize: 20 }}>{group?.emoji || '👥'}</Text>
          </View>
          <View>
            <Text style={[styles.headerName, { color: theme.text }]}>{group?.name || '...'}</Text>
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>
              {language === 'fr' ? 'Toucher pour infos' : 'Tap for info'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} style={styles.messageList} contentContainerStyle={styles.messageContent}>
        {messages.map(msg => {
          const isMine = msg.sender_id === profile?.id;
          const isSystem = msg.message_type === 'system';

          if (isSystem) {
            return (
              <View key={msg.id} style={styles.systemMsg}>
                <Text style={[styles.systemText, { color: theme.textMuted }]}>{msg.content}</Text>
              </View>
            );
          }

          const senderAvatar = msg.sender ? getAvatarDisplay(msg.sender) : { type: 'letter' as const, value: '?' };

          return (
            <View key={msg.id} style={[styles.msgRow, { justifyContent: isMine ? 'flex-end' : 'flex-start' }]}>
              {!isMine && (
                <View style={[styles.senderAvatar, { backgroundColor: (msg.sender?.accent_color || theme.accent) + '20' }]}>
                  <Text style={{ fontSize: 14 }}>{senderAvatar.type === 'preset' ? senderAvatar.value : senderAvatar.value}</Text>
                </View>
              )}
              <View style={[
                styles.bubble,
                isMine ? styles.myBubble : styles.theirBubble,
                { backgroundColor: isMine ? theme.accent + '20' : theme.surface, borderColor: isMine ? theme.accent + '40' : theme.border },
              ]}>
                {!isMine && (
                  <Text style={[styles.senderName, { color: msg.sender?.accent_color || theme.accent }]}>
                    {msg.sender?.pseudo || '?'}
                  </Text>
                )}
                {msg.message_type === 'achievement' && <Text style={{ fontSize: 18, marginBottom: 4 }}>🏆</Text>}
                <Text style={[styles.bubbleText, { color: theme.text }]}>{msg.content}</Text>
                <Text style={[styles.msgTime, { color: theme.textMuted }]}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputRow, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={shareAchievement}>
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
  groupIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  headerName: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 12 },
  messageList: { flex: 1 },
  messageContent: { padding: 16, gap: 6 },
  systemMsg: { alignSelf: 'center', paddingVertical: 4, paddingHorizontal: 12, backgroundColor: '#FFF1', borderRadius: 12, marginVertical: 4 },
  systemText: { fontSize: 12, fontStyle: 'italic' },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  senderAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 18, borderWidth: 1 },
  myBubble: { borderBottomRightRadius: 4 },
  theirBubble: { borderBottomLeftRadius: 4 },
  senderName: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  msgTime: { fontSize: 10, marginTop: 4 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, paddingBottom: 30, alignItems: 'center' },
  input: { flex: 1, height: 44, paddingHorizontal: 16, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#0A0E1A', fontSize: 18, fontWeight: '700' },
});
