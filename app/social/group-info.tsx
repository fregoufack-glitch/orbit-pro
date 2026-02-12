import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useSocial, GroupMember } from '../../contexts/SocialContext';
import { getAvatarDisplay } from '../../components/ProfileAvatarButton';

const GROUP_EMOJIS = ['👥', '🔥', '💪', '🧘', '📚', '🎯', '🏆', '⚡', '🌟', '🎮', '🎵', '🌊', '🚀', '💎', '👑', '🦊'];

export default function GroupInfoScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { theme, profile, language } = useApp();
  const { groups, loadGroupMembers, updateGroup, deleteGroup, leaveGroup, addGroupMember, removeGroupMember, getGroupRole, friends } = useSocial();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);

  const group = groups.find(g => g.id === groupId);
  const myRole = groupId ? getGroupRole(groupId) : null;
  const isAdmin = myRole === 'admin';

  useEffect(() => {
    if (groupId) {
      loadGroupMembers(groupId).then(setMembers);
      if (group) { setName(group.name); setEmoji(group.emoji); }
    }
  }, [groupId, group?.name]);

  async function handleSaveEdit() {
    if (!groupId || !name.trim()) return;
    await updateGroup(groupId, { name: name.trim(), emoji });
    setEditing(false);
  }

  function handleDelete() {
    Alert.alert(
      language === 'fr' ? 'Supprimer le groupe' : 'Delete Group',
      language === 'fr' ? 'Cette action est irréversible.' : 'This action cannot be undone.',
      [
        { text: language === 'fr' ? 'Annuler' : 'Cancel' },
        { text: language === 'fr' ? 'Supprimer' : 'Delete', style: 'destructive', onPress: async () => {
          await deleteGroup(groupId!);
          router.replace('/social/conversations');
        }},
      ]
    );
  }

  function handleLeave() {
    Alert.alert(
      language === 'fr' ? 'Quitter le groupe' : 'Leave Group',
      language === 'fr' ? 'Êtes-vous sûr ?' : 'Are you sure?',
      [
        { text: language === 'fr' ? 'Annuler' : 'Cancel' },
        { text: language === 'fr' ? 'Quitter' : 'Leave', style: 'destructive', onPress: async () => {
          await leaveGroup(groupId!);
          router.replace('/social/conversations');
        }},
      ]
    );
  }

  async function handleAddMember(friendId: string) {
    if (!groupId) return;
    await addGroupMember(groupId, friendId);
    const updated = await loadGroupMembers(groupId);
    setMembers(updated);
    setShowAddMember(false);
  }

  async function handleRemoveMember(userId: string) {
    if (!groupId) return;
    Alert.alert(
      language === 'fr' ? 'Retirer le membre' : 'Remove Member',
      '',
      [
        { text: language === 'fr' ? 'Annuler' : 'Cancel' },
        { text: language === 'fr' ? 'Retirer' : 'Remove', style: 'destructive', onPress: async () => {
          await removeGroupMember(groupId, userId);
          const updated = await loadGroupMembers(groupId);
          setMembers(updated);
        }},
      ]
    );
  }

  const memberIds = new Set(members.map(m => m.user_id));
  const eligibleFriends = friends.filter(f => {
    const fid = (f as any).friend?.id;
    return fid && !memberIds.has(fid);
  });

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.closeBtn, { color: theme.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          {language === 'fr' ? 'Infos du groupe' : 'Group Info'}
        </Text>
        {isAdmin && (
          <TouchableOpacity onPress={() => editing ? handleSaveEdit() : setEditing(true)}>
            <Text style={[styles.editBtn, { color: theme.accent }]}>
              {editing ? '✓' : '✏️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Group header */}
      <View style={[styles.groupHeader, { backgroundColor: theme.surface }]}>
        {editing ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
              {GROUP_EMOJIS.map(e => (
                <TouchableOpacity key={e} style={[styles.emojiBtn, emoji === e && { backgroundColor: theme.accent + '30' }]} onPress={() => setEmoji(e)}>
                  <Text style={{ fontSize: 28 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={[styles.nameInput, { color: theme.text, borderColor: theme.accent }]}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </>
        ) : (
          <>
            <Text style={styles.groupEmoji}>{group.emoji}</Text>
            <Text style={[styles.groupName, { color: theme.text }]}>{group.name}</Text>
            <Text style={[styles.groupMeta, { color: theme.textMuted }]}>
              {members.length} {language === 'fr' ? 'membres' : 'members'}
            </Text>
          </>
        )}
      </View>

      {/* Members */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            👥 {language === 'fr' ? 'Membres' : 'Members'} ({members.length})
          </Text>
          {isAdmin && (
            <TouchableOpacity onPress={() => setShowAddMember(!showAddMember)}>
              <Text style={[styles.addMemberBtn, { color: theme.accent }]}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Add member */}
        {showAddMember && (
          <View style={styles.addMemberSection}>
            {eligibleFriends.length === 0 ? (
              <Text style={[styles.noFriends, { color: theme.textMuted }]}>
                {language === 'fr' ? 'Tous vos amis sont déjà dans le groupe' : 'All friends are already in the group'}
              </Text>
            ) : (
              eligibleFriends.map(f => {
                const friend = (f as any).friend;
                if (!friend) return null;
                const av = getAvatarDisplay(friend);
                return (
                  <TouchableOpacity
                    key={friend.id}
                    style={[styles.addFriendRow, { backgroundColor: theme.surfaceLight }]}
                    onPress={() => handleAddMember(friend.id)}
                  >
                    <View style={[styles.memberAvatar, { backgroundColor: (friend.accent_color || theme.accent) + '20' }]}>
                      <Text style={{ fontSize: 16 }}>{av.type === 'preset' ? av.value : av.value}</Text>
                    </View>
                    <Text style={[styles.memberName, { color: theme.text }]}>{friend.pseudo}</Text>
                    <Text style={[styles.addText, { color: theme.accent }]}>+</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {members.map(member => {
          const avatar = member.user ? getAvatarDisplay(member.user) : { type: 'letter' as const, value: '?' };
          const isMe = member.user_id === profile?.id;

          return (
            <View key={member.id} style={styles.memberRow}>
              <View style={[styles.memberAvatar, { backgroundColor: (member.user?.accent_color || theme.accent) + '20' }]}>
                <Text style={{ fontSize: 18 }}>{avatar.type === 'preset' ? avatar.value : avatar.value}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: theme.text }]}>
                  {member.user?.pseudo || '?'} {isMe ? `(${language === 'fr' ? 'vous' : 'you'})` : ''}
                </Text>
                {member.role === 'admin' && (
                  <Text style={[styles.roleBadge, { color: theme.accent }]}>
                    {language === 'fr' ? 'Admin' : 'Admin'}
                  </Text>
                )}
              </View>
              {isAdmin && !isMe && (
                <TouchableOpacity onPress={() => handleRemoveMember(member.user_id)}>
                  <Text style={[styles.removeBtn, { color: theme.error }]}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {/* Actions */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={[styles.actionRow, { borderBottomColor: theme.border }]} onPress={handleLeave}>
          <Text style={[styles.actionText, { color: '#FF6B6B' }]}>
            🚪 {language === 'fr' ? 'Quitter le groupe' : 'Leave Group'}
          </Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={styles.actionRow} onPress={handleDelete}>
            <Text style={[styles.actionText, { color: '#FF6B6B' }]}>
              🗑️ {language === 'fr' ? 'Supprimer le groupe' : 'Delete Group'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  closeBtn: { fontSize: 22, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '900' },
  editBtn: { fontSize: 20 },
  groupHeader: { marginHorizontal: 16, borderRadius: 20, padding: 24, alignItems: 'center' },
  groupEmoji: { fontSize: 56, marginBottom: 8 },
  groupName: { fontSize: 24, fontWeight: '800' },
  groupMeta: { fontSize: 14, marginTop: 4 },
  emojiRow: { maxHeight: 48, marginBottom: 12 },
  emojiBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  nameInput: { fontSize: 20, fontWeight: '700', borderBottomWidth: 2, paddingBottom: 4, textAlign: 'center', width: '80%' },
  section: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  addMemberBtn: { fontSize: 24, fontWeight: '700' },
  addMemberSection: { marginBottom: 12, gap: 6 },
  addFriendRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, gap: 10 },
  addText: { fontSize: 20, fontWeight: '700' },
  noFriends: { fontSize: 13, textAlign: 'center', padding: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600' },
  roleBadge: { fontSize: 12, fontWeight: '700', marginTop: 1 },
  removeBtn: { fontSize: 18, fontWeight: '700', padding: 8 },
  actionRow: { paddingVertical: 14, borderBottomWidth: 0.5 },
  actionText: { fontSize: 15, fontWeight: '600' },
});
