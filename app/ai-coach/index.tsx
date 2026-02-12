import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import { askCoach, getRemainingMessages } from '../../services/aiCoach';

const QUICK_ACTIONS = [
  'ai.quick_progress',
  'ai.quick_plan_day',
  'ai.quick_motivation',
  'ai.quick_challenge',
  'ai.quick_streak_tips',
  'ai.quick_badges',
];

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
}

export default function AICoachScreen() {
  const router = useRouter();
  const { theme, language, profile, habits, todayCompletions, badges } = useApp();
  const scrollRef = useRef<ScrollView>(null);
  const streak = profile?.streak_days || 0;
  const [remaining, setRemaining] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: t('ai.greeting'), isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    getRemainingMessages().then(setRemaining);
  }, []);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), text: msg, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askCoach(msg, {
        pseudo: profile?.pseudo || 'User',
        level: profile?.level || 1,
        xp: profile?.xp || 0,
        streak,
        habitsCount: habits.length,
        todayCompleted: todayCompletions.length,
        todayTotal: habits.filter(h => h.is_active).length,
        badges: badges.map(b => b.badge_emoji),
        language,
      });

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: response, isBot: true }]);
      const r = await getRemainingMessages();
      setRemaining(r);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: '❌ Error', isBot: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>🤖 {t('ai.title')}</Text>
        <View style={{ width: 22 }}>
          {remaining !== null && (
            <Text style={[styles.remaining, { color: theme.textMuted }]}>{remaining}</Text>
          )}
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.chatList} contentContainerStyle={styles.chatContent}>
        {messages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.bubble,
              msg.isBot ? styles.botBubble : styles.userBubble,
              { backgroundColor: msg.isBot ? theme.surface : theme.accent + '20' },
            ]}
          >
            {msg.isBot && <Text style={styles.botAvatar}>🤖</Text>}
            <Text style={[styles.bubbleText, { color: theme.text }]}>{msg.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.bubble, styles.botBubble, { backgroundColor: theme.surface }]}>
            <Text style={styles.botAvatar}>🤖</Text>
            <Text style={[styles.bubbleText, { color: theme.textMuted }]}>...</Text>
          </View>
        )}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow} contentContainerStyle={styles.quickContent}>
        {QUICK_ACTIONS.map(action => (
          <TouchableOpacity
            key={action}
            style={[styles.quickBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => sendMessage(t(action))}
          >
            <Text style={[styles.quickText, { color: theme.accent }]}>{t(action)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.inputRow, { backgroundColor: theme.surface }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={input}
          onChangeText={setInput}
          placeholder={t('ai.placeholder')}
          placeholderTextColor={theme.textMuted}
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.accent }]} onPress={() => sendMessage()} disabled={loading}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  closeBtn: { fontSize: 22, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '900' },
  remaining: { fontSize: 12, textAlign: 'right' },
  chatList: { flex: 1 },
  chatContent: { padding: 16 },
  bubble: { padding: 14, borderRadius: 18, marginBottom: 8, maxWidth: '85%' },
  botBubble: { alignSelf: 'flex-start', flexDirection: 'row', gap: 8 },
  userBubble: { alignSelf: 'flex-end' },
  botAvatar: { fontSize: 18 },
  bubbleText: { fontSize: 15, lineHeight: 22, flex: 1 },
  quickRow: { maxHeight: 52, borderTopWidth: 0.5, borderTopColor: '#252B3F' },
  quickContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  quickText: { fontSize: 13, fontWeight: '600' },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, paddingBottom: 30 },
  input: { flex: 1, height: 44, paddingHorizontal: 16, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#0A0A0F', fontSize: 18, fontWeight: '700' },
});
