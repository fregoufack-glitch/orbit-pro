import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useSocial } from '../../contexts/SocialContext';
import { getAvatarDisplay } from '../../components/ProfileAvatarButton';

const GROUP_EMOJIS = ['👥', '🔥', '💪', '🧘', '📚', '🎯', '🏆', '⚡', '🌟', '🎮', '🎵', '🌊', '🚀', '💎', '👑', '🦊'];

export default function CreateGroupScreen() {
  const router = useRouter();
  const { theme, language } = useApp();
  const { friends, createGroup } = useSocial();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('👥');
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  function toggleFriend(id: string) {
    setSelectedFriends(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert(language === 'fr' ? 'Erreur' : 'Error', language === 'fr' ? 'Nom du groupe requis' : 'Group name required');
      return;
    }
    if (selectedFriends.size === 0) {
      Alert.alert(language === 'fr' ? 'Erreur' : 'Error', language === 'fr' ? 'Ajoutez au moins un ami' : 'Add at least one friend');
      return;
    }

    const groupId = await createGroup(name.trim(), emoji, [...selectedFriends]);
    if (groupId) {
      router.replace(`/social/group-chat?groupId=${groupId}`);
    } else {
      Alert.alert(language === 'fr' ? 'Erreur' : 'Error', language === 'fr' ? 'Impossible de créer le groupe' : 'Failed to create group');
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          {language === 'fr' ? 'Nouveau groupe' : 'New Group'}
        </Text>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={[styles.createBtn, { color: theme.accent }]}>
            {language === 'fr' ? 'Créer' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: theme.surface }]}>
          <Text style={styles.previewEmoji}>{emoji}</Text>
          <Text style={[styles.previewName, { color: theme.text }]}>
            {name || (language === 'fr' ? 'Nom du groupe' : 'Group name')}
          </Text>
          <Text style={[styles.previewCount, { color: theme.textMuted }]}>
            {selectedFriends.size + 1} {language === 'fr' ? 'membres' : 'members'}
          </Text>
        </View>

        {/* Name */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {language === 'fr' ? 'Nom du groupe' : 'Group name'}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          value={name}
          onChangeText={setName}
          placeholder={language === 'fr' ? 'Ex: Squad Fitness 💪' : 'Ex: Fitness Squad 💪'}
          placeholderTextColor={theme.textMuted}
          maxLength={50}
        />

        {/* Emoji */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>Emoji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
          {GROUP_EMOJIS.map(e => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiBtn, emoji === e && { backgroundColor: theme.accent + '30', borderColor: theme.accent }]}
              onPress={() => setEmoji(e)}
            >
              <Text style={{ fontSize: 24 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Select Friends */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {language === 'fr' ? 'Ajouter des amis' : 'Add friends'} ({selectedFriends.size})
        </Text>

        {friends.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {language === 'fr' ? 'Ajoutez des amis d\'abord' : 'Add friends first'}
            </Text>
          </View>
        ) : (
          friends.map(f => {
            const friend = (f as any).friend;
            if (!friend) return null;
            const avatar = getAvatarDisplay(friend);
            const selected = selectedFriends.has(friend.id);

            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.friendRow, { backgroundColor: selected ? theme.accent + '10' : theme.surface, borderColor: selected ? theme.accent : theme.border }]}
                onPress={() => toggleFriend(friend.id)}
              >
                <View style={[styles.friendAvatar, { backgroundColor: (friend.accent_color || theme.accent) + '30' }]}>
                  <Text style={{ fontSize: 20 }}>{avatar.type === 'preset' ? avatar.value : avatar.value}</Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={[styles.friendName, { color: theme.text }]}>{friend.pseudo}</Text>
                  <Text style={[styles.friendLevel, { color: theme.textMuted }]}>Lv.{friend.level}</Text>
                </View>
                <View style={[styles.checkCircle, { borderColor: selected ? theme.accent : theme.border, backgroundColor: selected ? theme.accent : 'transparent' }]}>
                  {selected && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </TouchableOpacity>
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
  title: { fontSize: 20, fontWeight: '900' },
  createBtn: { fontSize: 17, fontWeight: '700' },
  content: { flex: 1 },
  preview: { marginHorizontal: 16, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  previewEmoji: { fontSize: 48, marginBottom: 8 },
  previewName: { fontSize: 20, fontWeight: '700' },
  previewCount: { fontSize: 13, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', marginLeft: 16, marginBottom: 8, marginTop: 16 },
  input: { marginHorizontal: 16, height: 52, borderRadius: 14, paddingHorizontal: 16, fontSize: 16, borderWidth: 1 },
  emojiRow: { marginLeft: 16, maxHeight: 52, marginBottom: 8 },
  emojiBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14 },
  friendRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 6, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1 },
  friendAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 16, fontWeight: '600' },
  friendLevel: { fontSize: 12, marginTop: 2 },
  checkCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#0A0E1A', fontSize: 16, fontWeight: '800' },
});
