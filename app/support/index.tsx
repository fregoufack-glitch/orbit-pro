import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Linking, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import BannerAd from '../../components/BannerAd';

const FAQ_ITEMS = [
  { q: 'support.faq_1_q', a: 'support.faq_1_a' },
  { q: 'support.faq_2_q', a: 'support.faq_2_a' },
  { q: 'support.faq_3_q', a: 'support.faq_3_a' },
  { q: 'support.faq_4_q', a: 'support.faq_4_a' },
  { q: 'support.faq_5_q', a: 'support.faq_5_a' },
];

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
}

export default function SupportScreen() {
  const router = useRouter();
  const { theme, language } = useApp();
  const [tab, setTab] = useState<'faq' | 'chat'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', text: t('support.chatbot_greeting'), isBot: true },
  ]);
  const [input, setInput] = useState('');

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), text: input.trim(), isBot: false };
    setChatMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simple chatbot responses
    setTimeout(() => {
      const lower = input.toLowerCase();
      let response = '';

      if (lower.includes('habit') || lower.includes('habitude')) {
        response = language === 'fr'
          ? 'Pour créer une habitude, allez dans l\'onglet Habitudes et appuyez sur +. Vous pouvez personnaliser l\'emoji, la couleur, la catégorie et la fréquence.'
          : 'To create a habit, go to the Habits tab and tap +. You can customize the emoji, color, category, and frequency.';
      } else if (lower.includes('xp') || lower.includes('level') || lower.includes('niveau')) {
        response = language === 'fr'
          ? 'Vous gagnez 10 XP par habitude complétée, 50 XP pour une journée parfaite, et 20 XP de bonus de série. Montez de niveau en accumulant des XP !'
          : 'You earn 10 XP per completed habit, 50 XP for a perfect day, and 20 XP streak bonus. Level up by accumulating XP!';
      } else if (lower.includes('premium') || lower.includes('abonnement') || lower.includes('subscription')) {
        response = language === 'fr'
          ? 'Orbit Pro est 100% gratuit ! Toutes les fonctionnalités sont accessibles sans abonnement.'
          : 'Orbit Pro is 100% free! All features are accessible without subscription.';
      } else if (lower.includes('delete') || lower.includes('supprimer') || lower.includes('account') || lower.includes('compte')) {
        response = language === 'fr'
          ? 'Pour supprimer votre compte, allez dans Profil > Supprimer le compte. Attention, cette action est irréversible.'
          : 'To delete your account, go to Profile > Delete Account. Warning, this action is irreversible.';
      } else if (lower.includes('contact') || lower.includes('email') || lower.includes('help') || lower.includes('aide')) {
        response = language === 'fr'
          ? 'Vous pouvez nous contacter à miguelfreddy65@gmail.com pour toute question.'
          : 'You can contact us at miguelfreddy65@gmail.com for any questions.';
      } else {
        response = language === 'fr'
          ? 'Merci pour votre message ! Pour une aide plus spécifique, contactez-nous à miguelfreddy65@gmail.com.'
          : 'Thanks for your message! For more specific help, contact us at miguelfreddy65@gmail.com.';
      }

      setChatMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: response, isBot: true }]);
    }, 800);
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('support.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={[styles.tab, tab === 'faq' && { backgroundColor: theme.accent }]} onPress={() => setTab('faq')}>
          <Text style={[styles.tabText, { color: tab === 'faq' ? '#0A0E1A' : theme.textSecondary }]}>❓ {t('support.faq')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'chat' && { backgroundColor: theme.accent }]} onPress={() => setTab('chat')}>
          <Text style={[styles.tabText, { color: tab === 'chat' ? '#0A0E1A' : theme.textSecondary }]}>💬 {t('support.chatbot')}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'faq' ? (
        <ScrollView style={styles.faqList}>
          {FAQ_ITEMS.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.faqItem, { backgroundColor: theme.surface }]}
              onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
            >
              <Text style={[styles.faqQuestion, { color: theme.text }]}>{t(faq.q)}</Text>
              {expandedFaq === i && (
                <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>{t(faq.a)}</Text>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.contactBtn, { backgroundColor: theme.surface }]}
            onPress={() => Linking.openURL('mailto:miguelfreddy65@gmail.com')}
          >
            <Text style={styles.contactEmoji}>✉️</Text>
            <View>
              <Text style={[styles.contactTitle, { color: theme.text }]}>{t('support.contact_us')}</Text>
              <Text style={[styles.contactEmail, { color: theme.accent }]}>miguelfreddy65@gmail.com</Text>
            </View>
          </TouchableOpacity>
          <BannerAd />
        </ScrollView>
      ) : (
        <>
          <ScrollView style={styles.chatList}>
            {chatMessages.map(msg => (
              <View key={msg.id} style={[styles.chatBubble, msg.isBot ? styles.botBubble : styles.userBubble, { backgroundColor: msg.isBot ? theme.surface : theme.accent + '20' }]}>
                {msg.isBot && <Text style={styles.botIcon}>🤖</Text>}
                <Text style={[styles.chatText, { color: theme.text }]}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={[styles.inputRow, { backgroundColor: theme.surface }]}>
            <TextInput
              style={[styles.chatInput, { color: theme.text }]}
              value={input}
              onChangeText={setInput}
              placeholder={t('support.chatbot_placeholder')}
              placeholderTextColor={theme.textMuted}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.accent }]} onPress={sendMessage}>
              <Text style={styles.sendBtnText}>➤</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  closeBtn: { fontSize: 22, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '900' },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  faqList: { flex: 1, paddingHorizontal: 16 },
  faqItem: { borderRadius: 14, padding: 16, marginBottom: 8 },
  faqQuestion: { fontSize: 15, fontWeight: '700' },
  faqAnswer: { fontSize: 14, lineHeight: 22, marginTop: 8 },
  contactBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16, marginTop: 16, gap: 12 },
  contactEmoji: { fontSize: 28 },
  contactTitle: { fontSize: 15, fontWeight: '700' },
  contactEmail: { fontSize: 14, fontWeight: '600' },
  chatList: { flex: 1, paddingHorizontal: 16 },
  chatBubble: { padding: 14, borderRadius: 16, marginBottom: 8, maxWidth: '85%' },
  botBubble: { alignSelf: 'flex-start', flexDirection: 'row', gap: 8 },
  userBubble: { alignSelf: 'flex-end' },
  botIcon: { fontSize: 18 },
  chatText: { fontSize: 14, lineHeight: 20, flex: 1 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 8, paddingBottom: 30 },
  chatInput: { flex: 1, height: 44, paddingHorizontal: 16, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#0A0E1A', fontSize: 18, fontWeight: '700' },
});
