import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useSocial } from '../../contexts/SocialContext';
import { getAvatarDisplay } from '../../components/ProfileAvatarButton';
import { format } from 'date-fns';

export default function ChallengesScreen() {
  const router = useRouter();
  const { theme, profile, language } = useApp();
  const { challenges, loadChallenges, createChallenge, joinChallenge, updateChallengeProgress, friends, inviteFriendToChallenge } = useSocial();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [days, setDays] = useState('30');

  useEffect(() => { loadChallenges(); }, []);

  const EMOJIS = ['🎯', '🧘', '💪', '📚', '🏃', '💧', '🔥', '⭐', '🎨', '📝'];

  async function handleCreate() {
    if (!name.trim()) return;
    const id = await createChallenge({
      habit_name: name.trim(),
      description: desc.trim(),
      emoji,
      duration_days: parseInt(days) || 30,
      start_date: format(new Date(), 'yyyy-MM-dd'),
    });
    if (id) {
      setShowCreate(false);
      setName(''); setDesc(''); setDays('30');
      Alert.alert('✅', language === 'fr' ? 'Défi créé !' : 'Challenge created!');
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>🏆 {language === 'fr' ? 'Défis' : 'Challenges'}</Text>
        <TouchableOpacity onPress={() => setShowCreate(!showCreate)}>
          <Text style={[styles.createBtn, { color: theme.accent }]}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Create Form */}
        {showCreate && (
          <View style={[styles.createForm, { backgroundColor: theme.surface }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              {language === 'fr' ? 'Nouveau défi' : 'New Challenge'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceLight, color: theme.text }]}
              value={name} onChangeText={setName}
              placeholder={language === 'fr' ? 'Nom du défi' : 'Challenge name'}
              placeholderTextColor={theme.textMuted}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceLight, color: theme.text }]}
              value={desc} onChangeText={setDesc}
              placeholder="Description"
              placeholderTextColor={theme.textMuted}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
              {EMOJIS.map(e => (
                <TouchableOpacity key={e} style={[styles.emojiBtn, emoji === e && { backgroundColor: theme.accent + '30' }]} onPress={() => setEmoji(e)}>
                  <Text style={{ fontSize: 24 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surfaceLight, color: theme.text }]}
              value={days} onChangeText={setDays}
              placeholder={language === 'fr' ? 'Durée (jours)' : 'Duration (days)'}
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.accent }]} onPress={handleCreate}>
              <Text style={styles.submitBtnText}>{language === 'fr' ? 'Créer le défi' : 'Create Challenge'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Challenge List */}
        {challenges.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {language === 'fr' ? 'Aucun défi en cours' : 'No active challenges'}
            </Text>
          </View>
        ) : (
          challenges.map(challenge => {
            const isParticipant = challenge.participants?.some(p => p.user_id === profile?.id);
            const isCreator = challenge.creator_id === profile?.id;
            const daysLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / 86400000));
            const sorted = [...(challenge.participants || [])].sort((a, b) => b.completed_days - a.completed_days);

            return (
              <View key={challenge.id} style={[styles.challengeCard, { backgroundColor: theme.surface }]}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
                  <View style={styles.challengeInfo}>
                    <Text style={[styles.challengeName, { color: theme.text }]}>{challenge.habit_name}</Text>
                    <Text style={[styles.challengeDesc, { color: theme.textSecondary }]}>{challenge.description}</Text>
                    <Text style={[styles.challengeMeta, { color: theme.textMuted }]}>
                      {challenge.duration_days} {language === 'fr' ? 'jours' : 'days'} • {daysLeft} {language === 'fr' ? 'restants' : 'left'}
                    </Text>
                  </View>
                </View>

                {/* Leaderboard */}
                <View style={styles.leaderboard}>
                  {sorted.map((p, i) => {
                    const pAvatar = p.user ? getAvatarDisplay(p.user) : { type: 'letter' as const, value: '?' };
                    const medals = ['🥇', '🥈', '🥉'];
                    return (
                      <View key={p.id} style={styles.leaderRow}>
                        <Text style={[styles.leaderRank, { color: i < 3 ? theme.accent : theme.textMuted }]}>
                          {i < 3 ? medals[i] : `${i + 1}`}
                        </Text>
                        <View style={[styles.miniAvatar, { backgroundColor: theme.accent + '20' }]}>
                          <Text style={{ fontSize: 14 }}>{pAvatar.type === 'preset' ? pAvatar.value : pAvatar.value}</Text>
                        </View>
                        <Text style={[styles.leaderName, { color: theme.text }]}>{(p.user as any)?.pseudo || '?'}</Text>
                        <View style={[styles.progressBar, { backgroundColor: theme.surfaceLight }]}>
                          <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${Math.min((p.completed_days / challenge.duration_days) * 100, 100)}%` }]} />
                        </View>
                        <Text style={[styles.leaderDays, { color: theme.textSecondary }]}>{p.completed_days}d</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Actions */}
                <View style={styles.challengeActions}>
                  {!isParticipant && (
                    <TouchableOpacity style={[styles.joinBtn, { backgroundColor: theme.accent }]} onPress={() => joinChallenge(challenge.id)}>
                      <Text style={styles.joinBtnText}>{language === 'fr' ? 'Rejoindre' : 'Join'}</Text>
                    </TouchableOpacity>
                  )}
                  {isCreator && (
                    <TouchableOpacity
                      style={[styles.inviteBtn, { borderColor: theme.accent }]}
                      onPress={() => {
                        if (friends.length === 0) {
                          Alert.alert('', language === 'fr' ? 'Ajoutez des amis d\'abord' : 'Add friends first');
                          return;
                        }
                        // Quick invite: invite first friend not already in
                        const eligible = friends.filter(f => {
                          const fid = (f as any).friend?.id;
                          return fid && !challenge.participants?.some(p => p.user_id === fid);
                        });
                        if (eligible.length === 0) {
                          Alert.alert('', language === 'fr' ? 'Tous vos amis participent déjà' : 'All friends already joined');
                        } else {
                          inviteFriendToChallenge(challenge.id, (eligible[0] as any).friend.id);
                          Alert.alert('✅', language === 'fr' ? 'Invitation envoyée' : 'Invite sent');
                        }
                      }}
                    >
                      <Text style={[styles.inviteBtnText, { color: theme.accent }]}>
                        {language === 'fr' ? '📩 Inviter' : '📩 Invite'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
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
  title: { fontSize: 22, fontWeight: '900' },
  createBtn: { fontSize: 28, fontWeight: '700' },
  content: { flex: 1 },
  createForm: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 16 },
  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { height: 48, borderRadius: 12, paddingHorizontal: 14, fontSize: 15, marginBottom: 10 },
  emojiRow: { maxHeight: 48, marginBottom: 10 },
  emojiBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  submitBtn: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#0A0E1A', fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16 },
  challengeCard: { marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12 },
  challengeHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  challengeEmoji: { fontSize: 36 },
  challengeInfo: { flex: 1 },
  challengeName: { fontSize: 18, fontWeight: '700' },
  challengeDesc: { fontSize: 13, marginTop: 2 },
  challengeMeta: { fontSize: 12, marginTop: 4 },
  leaderboard: { gap: 8, marginBottom: 12 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leaderRank: { width: 24, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  leaderName: { width: 70, fontSize: 13, fontWeight: '600' },
  progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  leaderDays: { fontSize: 12, fontWeight: '600', width: 30, textAlign: 'right' },
  challengeActions: { flexDirection: 'row', gap: 8 },
  joinBtn: { flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  joinBtnText: { color: '#0A0E1A', fontSize: 15, fontWeight: '700' },
  inviteBtn: { flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  inviteBtnText: { fontSize: 14, fontWeight: '700' },
});
