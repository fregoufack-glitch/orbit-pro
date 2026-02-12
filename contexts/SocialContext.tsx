import React, { createContext, useContext, useEffect, useState, useRef, useMemo, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from './AppContext';
import { RealtimeChannel } from '@supabase/supabase-js';

// ============================================
// TYPES
// ============================================
export interface FriendProfile {
  id: string;
  pseudo: string;
  avatar_url: string | null;
  preset_avatar: string;
  bio: string;
  mood_emoji: string;
  mood_text: string;
  banner_url: string | null;
  banner_gradient: string;
  display_name_style: string;
  badge_showcase: any[];
  streak_style: string;
  profile_theme: string;
  xp: number;
  level: number;
  streak_days: number;
  longest_streak: number;
  privacy: string;
  custom_title: string;
  accent_color: string;
  last_active_date: string | null;
}

const PROFILE_SELECT = 'id,pseudo,avatar_url,preset_avatar,bio,mood_emoji,mood_text,banner_url,banner_gradient,display_name_style,badge_showcase,streak_style,profile_theme,xp,level,streak_days,longest_streak,privacy,custom_title,accent_color,last_active_date';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  friend_streak: number;
  last_interaction_date: string | null;
  created_at: string;
  friend?: FriendProfile;
}

export interface FeedItem {
  id: string;
  user_id: string;
  content_type: string;
  content_json: any;
  created_at: string;
  user?: FriendProfile;
  reactions?: Reaction[];
}

export interface Story {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string;
  habit_id: string | null;
  view_count: number;
  created_at: string;
  expires_at: string;
  user?: FriendProfile;
  viewed?: boolean;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  message_type: string;
  expire_mode: string;
  expires_at: string | null;
  metadata: any;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  creator_id: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  muted: boolean;
  joined_at: string;
  user?: FriendProfile;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  message_type: string;
  metadata: any;
  created_at: string;
  sender?: FriendProfile;
}

export interface Challenge {
  id: string;
  creator_id: string;
  habit_name: string;
  description: string;
  emoji: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  creator?: FriendProfile;
  participants?: ChallengeParticipant[];
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  completed_days: number;
  joined_at: string;
  user?: FriendProfile;
}

export interface Reaction {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  emoji: string;
  created_at: string;
}

// Unified conversation (DM or Group) for the conversation list
export interface Conversation {
  id: string;              // friendId for DMs, groupId for groups
  type: 'dm' | 'group';
  name: string;
  emoji?: string;          // group emoji
  avatar?: FriendProfile;  // friend profile for DMs
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  friendStreak?: number;   // DMs only
}

interface SocialContextType {
  // Friends
  friends: Friendship[];
  pendingRequests: Friendship[];
  friendIds: string[];
  isFriend: (userId: string) => boolean;
  loadFriends: () => Promise<void>;
  sendFriendRequest: (pseudo: string) => Promise<{ error?: string }>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  declineFriendRequest: (friendshipId: string) => Promise<void>;
  blockUser: (friendshipId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<void>;

  // Feed
  feed: FeedItem[];
  loadFeed: () => Promise<void>;
  postFeedItem: (type: string, content: any) => Promise<void>;

  // Stories
  stories: Story[];
  friendStoryGroups: { userId: string; user: FriendProfile; stories: Story[]; hasNew: boolean }[];
  loadStories: () => Promise<void>;
  postStory: (imageUrl: string | null, caption: string, habitId?: string) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;

  // DMs (friends only)
  conversations: Conversation[];
  loadConversations: () => Promise<void>;
  loadDMMessages: (friendId: string) => Promise<Message[]>;
  sendDM: (receiverId: string, content: string, type?: string, imageUrl?: string, expireMode?: string, metadata?: any) => Promise<{ error?: string }>;
  markDMRead: (messageId: string) => Promise<void>;

  // Groups
  groups: Group[];
  loadGroups: () => Promise<void>;
  createGroup: (name: string, emoji: string, memberIds: string[]) => Promise<string | null>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  addGroupMember: (groupId: string, userId: string) => Promise<void>;
  removeGroupMember: (groupId: string, userId: string) => Promise<void>;
  loadGroupMembers: (groupId: string) => Promise<GroupMember[]>;
  loadGroupMessages: (groupId: string) => Promise<GroupMessage[]>;
  sendGroupMessage: (groupId: string, content: string, type?: string, imageUrl?: string, metadata?: any) => Promise<void>;
  markGroupRead: (groupId: string) => Promise<void>;
  getGroupRole: (groupId: string) => 'admin' | 'member' | null;

  // Challenges
  challenges: Challenge[];
  loadChallenges: () => Promise<void>;
  createChallenge: (data: { habit_name: string; description: string; emoji: string; duration_days: number; start_date: string }) => Promise<string | null>;
  joinChallenge: (challengeId: string) => Promise<void>;
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<void>;
  inviteFriendToChallenge: (challengeId: string, friendId: string) => Promise<void>;

  // Reactions
  addReaction: (targetType: string, targetId: string, emoji: string) => Promise<void>;
  removeReaction: (targetType: string, targetId: string) => Promise<void>;

  // Encouragement
  sendEncouragement: (friendId: string) => Promise<void>;

  // Profile view
  loadUserProfile: (userId: string) => Promise<FriendProfile | null>;
  loadUserBadges: (userId: string) => Promise<any[]>;
  getMutualFriendsCount: (userId: string) => Promise<number>;

  // Search & Leaderboard
  searchUsers: (query: string) => Promise<FriendProfile[]>;
  loadLeaderboard: () => Promise<{ user: FriendProfile; xp: number }[]>;

  // Typing
  sendTypingIndicator: (target: string, isGroup?: boolean) => void;
  typingUsers: Set<string>;
}

const SocialContext = createContext<SocialContextType>({} as SocialContextType);

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useApp();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const groupMembershipsRef = useRef<Map<string, 'admin' | 'member'>>(new Map());

  const friendIds = useMemo(() =>
    friends.map(f => f.requester_id === user?.id ? f.addressee_id : f.requester_id),
    [friends, user?.id]
  );

  function isFriend(userId: string): boolean {
    return friendIds.includes(userId);
  }

  const friendStoryGroups = useMemo(() => {
    const grps: Record<string, { userId: string; user: FriendProfile; stories: Story[]; hasNew: boolean }> = {};
    for (const story of stories) {
      if (!story.user) continue;
      if (!grps[story.user_id]) {
        grps[story.user_id] = { userId: story.user_id, user: story.user, stories: [], hasNew: false };
      }
      grps[story.user_id].stories.push(story);
      if (!story.viewed) grps[story.user_id].hasNew = true;
    }
    return Object.values(grps);
  }, [stories]);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFeed();
      loadStories();
      loadGroups();
      loadChallenges();
      setupRealtime();
    }
    return () => { channelRef.current && supabase.removeChannel(channelRef.current); };
  }, [user?.id]);

  // Rebuild conversations whenever DM/group data changes
  useEffect(() => {
    if (user) loadConversations();
  }, [friends.length, groups.length, user?.id]);

  function setupRealtime() {
    if (!user) return;
    channelRef.current = supabase
      .channel(`social-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => loadConversations())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages' }, () => loadConversations())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friendships', filter: `addressee_id=eq.${user.id}` }, () => loadFriends())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => loadStories())
      .on('broadcast', { event: 'typing' }, (payload) => {
        const sid = payload.payload?.senderId;
        if (sid) {
          setTypingUsers(prev => new Set([...prev, sid]));
          setTimeout(() => setTypingUsers(prev => { const n = new Set(prev); n.delete(sid); return n; }), 3000);
        }
      })
      .subscribe();
  }

  // ============================================
  // HELPERS
  // ============================================
  async function fetchProfiles(ids: string[]): Promise<Map<string, FriendProfile>> {
    if (ids.length === 0) return new Map();
    const { data } = await supabase.from('profiles').select(PROFILE_SELECT).in('id', ids);
    return new Map((data || []).map(p => [p.id, p as FriendProfile]));
  }

  // ============================================
  // FRIENDS
  // ============================================
  async function loadFriends() {
    if (!user) return;
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!data) return;

    const accepted: Friendship[] = [];
    const pending: Friendship[] = [];
    const fIds: string[] = [];

    for (const f of data) {
      const fid = f.requester_id === user.id ? f.addressee_id : f.requester_id;
      fIds.push(fid);
      if (f.status === 'accepted') accepted.push(f);
      else if (f.status === 'pending' && f.addressee_id === user.id) pending.push(f);
    }

    const profileMap = await fetchProfiles(fIds);
    for (const f of [...accepted, ...pending]) {
      const fid = f.requester_id === user.id ? f.addressee_id : f.requester_id;
      (f as any).friend = profileMap.get(fid) || null;
    }

    setFriends(accepted);
    setPendingRequests(pending);
  }

  async function sendFriendRequest(pseudo: string) {
    if (!user) return { error: 'Not logged in' };
    const { data: target } = await supabase.from('profiles').select('id').eq('pseudo', pseudo).single();
    if (!target) return { error: 'User not found' };
    if (target.id === user.id) return { error: 'Cannot add yourself' };
    const { error } = await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: target.id, status: 'pending' });
    if (error) return { error: error.message };
    await loadFriends();
    return {};
  }

  async function acceptFriendRequest(id: string) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id);
    await loadFriends();
  }

  async function declineFriendRequest(id: string) {
    await supabase.from('friendships').delete().eq('id', id);
    await loadFriends();
  }

  async function blockUser(id: string) {
    await supabase.from('friendships').update({ status: 'blocked' }).eq('id', id);
    await loadFriends();
  }

  async function removeFriend(id: string) {
    await supabase.from('friendships').delete().eq('id', id);
    await loadFriends();
  }

  // ============================================
  // FEED
  // ============================================
  async function loadFeed() {
    if (!user) return;
    const allIds = [user.id, ...friendIds];
    const { data } = await supabase.from('social_feed').select('*').in('user_id', allIds).order('created_at', { ascending: false }).limit(50);
    if (!data) return;
    const profileMap = await fetchProfiles([...new Set(data.map(d => d.user_id))]);
    const feedIds = data.map(d => d.id);
    const { data: reactions } = await supabase.from('reactions').select('*').eq('target_type', 'feed').in('target_id', feedIds);
    const rxMap = new Map<string, Reaction[]>();
    for (const r of (reactions || [])) { if (!rxMap.has(r.target_id)) rxMap.set(r.target_id, []); rxMap.get(r.target_id)!.push(r); }
    setFeed(data.map(d => ({ ...d, user: profileMap.get(d.user_id), reactions: rxMap.get(d.id) || [] })));
  }

  async function postFeedItem(type: string, content: any) {
    if (!user) return;
    await supabase.from('social_feed').insert({ user_id: user.id, content_type: type, content_json: content });
  }

  // ============================================
  // STORIES
  // ============================================
  async function loadStories() {
    if (!user) return;
    const allIds = [user.id, ...friendIds];
    const { data } = await supabase.from('stories').select('*').in('user_id', allIds).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false });
    if (!data) return;
    const profileMap = await fetchProfiles([...new Set(data.map(d => d.user_id))]);
    const sIds = data.map(d => d.id);
    const { data: views } = await supabase.from('story_views').select('story_id').eq('viewer_id', user.id).in('story_id', sIds);
    const viewedSet = new Set((views || []).map(v => v.story_id));
    setStories(data.map(d => ({ ...d, user: profileMap.get(d.user_id), viewed: viewedSet.has(d.id) })));
  }

  async function postStory(imageUrl: string | null, caption: string, habitId?: string) {
    if (!user) return;
    await supabase.from('stories').insert({ user_id: user.id, image_url: imageUrl, caption, habit_id: habitId || null });
    await loadStories();
  }

  async function viewStory(storyId: string) {
    if (!user) return;
    await supabase.from('story_views').upsert({ story_id: storyId, viewer_id: user.id }, { onConflict: 'story_id,viewer_id' });
  }

  // ============================================
  // DMs (friends-only)
  // ============================================
  async function loadConversations() {
    if (!user) return;

    const convs: Conversation[] = [];

    // 1. Load DM conversations
    const { data: dms } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(300);

    if (dms) {
      const dmMap = new Map<string, { last: Message; unread: number }>();
      for (const msg of dms) {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!dmMap.has(partnerId)) dmMap.set(partnerId, { last: msg, unread: 0 });
        if (!msg.is_read && msg.receiver_id === user.id) dmMap.get(partnerId)!.unread++;
      }

      const partnerIds = [...dmMap.keys()];
      const profileMap = await fetchProfiles(partnerIds);

      for (const [pid, info] of dmMap) {
        const p = profileMap.get(pid);
        if (!p) continue;
        const friendship = friends.find(f =>
          (f.requester_id === user.id && f.addressee_id === pid) ||
          (f.addressee_id === user.id && f.requester_id === pid)
        );
        convs.push({
          id: pid,
          type: 'dm',
          name: p.pseudo,
          avatar: p,
          lastMessage: info.last.content || (info.last.message_type === 'snap' ? '📸 Snap' : ''),
          lastMessageTime: info.last.created_at,
          unread: info.unread,
          friendStreak: friendship?.friend_streak || 0,
        });
      }
    }

    // 2. Load group conversations
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id, role')
      .eq('user_id', user.id);

    if (memberships && memberships.length > 0) {
      const gIds = memberships.map(m => m.group_id);
      groupMembershipsRef.current = new Map(memberships.map(m => [m.group_id, m.role as 'admin' | 'member']));

      const { data: grps } = await supabase.from('groups').select('*').in('id', gIds);
      if (grps) setGroups(grps as Group[]);

      // Get last message per group
      for (const gId of gIds) {
        const { data: lastMsgs } = await supabase
          .from('group_messages')
          .select('*')
          .eq('group_id', gId)
          .order('created_at', { ascending: false })
          .limit(1);

        const grp = (grps || []).find(g => g.id === gId);
        if (!grp) continue;

        // Unread count
        const { data: readData } = await supabase
          .from('group_message_reads')
          .select('last_read_at')
          .eq('group_id', gId)
          .eq('user_id', user.id)
          .single();

        const lastReadAt = readData?.last_read_at || '1970-01-01';
        const { count } = await supabase
          .from('group_messages')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', gId)
          .gt('created_at', lastReadAt)
          .neq('sender_id', user.id);

        const lastMsg = lastMsgs?.[0];
        convs.push({
          id: gId,
          type: 'group',
          name: grp.name,
          emoji: grp.emoji,
          lastMessage: lastMsg?.content || '',
          lastMessageTime: lastMsg?.created_at || grp.created_at,
          unread: count || 0,
        });
      }
    }

    // Sort by last message time
    convs.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    setConversations(convs);
  }

  async function loadDMMessages(friendId: string): Promise<Message[]> {
    if (!user) return [];
    // Enforce friends-only
    if (!isFriend(friendId)) return [];
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(100);
    return (data || []) as Message[];
  }

  async function sendDM(receiverId: string, content: string, type = 'text', imageUrl?: string, expireMode = '24h', metadata?: any) {
    if (!user) return { error: 'Not logged in' };
    // Enforce friends-only
    if (!isFriend(receiverId)) return { error: 'You can only DM accepted friends' };

    const expiresAt = expireMode === '24h' ? new Date(Date.now() + 86400000).toISOString() : expireMode === 'viewed' ? null : null;
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      image_url: imageUrl || null,
      message_type: type,
      expire_mode: expireMode,
      expires_at: expiresAt,
      metadata: metadata || {},
    });
    if (error) return { error: error.message };

    // Update friend streak
    const friendship = friends.find(f =>
      (f.requester_id === user.id && f.addressee_id === receiverId) ||
      (f.addressee_id === user.id && f.requester_id === receiverId)
    );
    if (friendship) {
      const today = new Date().toISOString().split('T')[0];
      if (friendship.last_interaction_date !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = friendship.last_interaction_date === yesterday ? (friendship.friend_streak || 0) + 1 : 1;
        await supabase.from('friendships').update({ friend_streak: newStreak, last_interaction_date: today }).eq('id', friendship.id);
      }
    }

    await loadConversations();
    return {};
  }

  async function markDMRead(messageId: string) {
    await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
  }

  // ============================================
  // GROUPS
  // ============================================
  async function loadGroups() {
    if (!user) return;
    const { data: memberships } = await supabase.from('group_members').select('group_id, role').eq('user_id', user.id);
    if (!memberships) return;
    const gIds = memberships.map(m => m.group_id);
    groupMembershipsRef.current = new Map(memberships.map(m => [m.group_id, m.role as 'admin' | 'member']));
    if (gIds.length === 0) { setGroups([]); return; }
    const { data } = await supabase.from('groups').select('*').in('id', gIds).order('updated_at', { ascending: false });
    setGroups((data || []) as Group[]);
  }

  async function createGroup(name: string, emoji: string, memberIds: string[]): Promise<string | null> {
    if (!user) return null;
    // All members must be friends
    const nonFriends = memberIds.filter(id => !isFriend(id));
    if (nonFriends.length > 0) return null;

    const { data: grp, error } = await supabase.from('groups').insert({
      name, emoji, creator_id: user.id,
    }).select('id').single();
    if (error || !grp) return null;

    // Add creator as admin
    await supabase.from('group_members').insert({ group_id: grp.id, user_id: user.id, role: 'admin' });

    // Add other members
    for (const mid of memberIds) {
      await supabase.from('group_members').insert({ group_id: grp.id, user_id: mid, role: 'member' });
    }

    // System message
    await supabase.from('group_messages').insert({
      group_id: grp.id,
      sender_id: user.id,
      content: `${profile?.pseudo} created the group`,
      message_type: 'system',
    });

    await loadGroups();
    await loadConversations();
    return grp.id;
  }

  async function updateGroup(groupId: string, updates: Partial<Group>) {
    await supabase.from('groups').update(updates).eq('id', groupId);
    await loadGroups();
  }

  async function deleteGroup(groupId: string) {
    if (!user) return;
    // Only creator/admin
    if (getGroupRole(groupId) !== 'admin') return;
    await supabase.from('group_message_reads').delete().eq('group_id', groupId);
    await supabase.from('group_messages').delete().eq('group_id', groupId);
    await supabase.from('group_members').delete().eq('group_id', groupId);
    await supabase.from('groups').delete().eq('id', groupId);
    await loadGroups();
    await loadConversations();
  }

  async function leaveGroup(groupId: string) {
    if (!user) return;
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id);
    await supabase.from('group_messages').insert({
      group_id: groupId, sender_id: user.id,
      content: `${profile?.pseudo} left the group`, message_type: 'system',
    });
    await loadGroups();
    await loadConversations();
  }

  async function addGroupMember(groupId: string, userId: string) {
    if (!user || getGroupRole(groupId) !== 'admin') return;
    if (!isFriend(userId)) return; // Must be a friend
    await supabase.from('group_members').insert({ group_id: groupId, user_id: userId, role: 'member' });
    await supabase.from('group_messages').insert({
      group_id: groupId, sender_id: user.id,
      content: `A new member was added`, message_type: 'system',
    });
  }

  async function removeGroupMember(groupId: string, userId: string) {
    if (!user || getGroupRole(groupId) !== 'admin') return;
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
    await supabase.from('group_messages').insert({
      group_id: groupId, sender_id: user.id,
      content: `A member was removed`, message_type: 'system',
    });
  }

  async function loadGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data } = await supabase.from('group_members').select('*').eq('group_id', groupId).order('joined_at');
    if (!data) return [];
    const profileMap = await fetchProfiles(data.map(m => m.user_id));
    return data.map(m => ({ ...m, user: profileMap.get(m.user_id) })) as GroupMember[];
  }

  async function loadGroupMessages(groupId: string): Promise<GroupMessage[]> {
    const { data } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(100);
    if (!data) return [];
    const profileMap = await fetchProfiles([...new Set(data.map(m => m.sender_id))]);
    return data.map(m => ({ ...m, sender: profileMap.get(m.sender_id) })) as GroupMessage[];
  }

  async function sendGroupMessage(groupId: string, content: string, type = 'text', imageUrl?: string, metadata?: any) {
    if (!user) return;
    await supabase.from('group_messages').insert({
      group_id: groupId,
      sender_id: user.id,
      content,
      image_url: imageUrl || null,
      message_type: type,
      metadata: metadata || {},
    });
    // Bump group updated_at
    await supabase.from('groups').update({ updated_at: new Date().toISOString() }).eq('id', groupId);
    await loadConversations();
  }

  async function markGroupRead(groupId: string) {
    if (!user) return;
    await supabase.from('group_message_reads').upsert({
      group_id: groupId, user_id: user.id, last_read_at: new Date().toISOString(),
    }, { onConflict: 'group_id,user_id' });
  }

  function getGroupRole(groupId: string): 'admin' | 'member' | null {
    return groupMembershipsRef.current.get(groupId) || null;
  }

  // ============================================
  // CHALLENGES
  // ============================================
  async function loadChallenges() {
    if (!user) return;
    const { data: myParts } = await supabase.from('challenge_participants').select('challenge_id').eq('user_id', user.id);
    const pIds = (myParts || []).map(p => p.challenge_id);
    const { data } = await supabase.from('challenges').select('*')
      .or(`creator_id.eq.${user.id}${pIds.length > 0 ? `,id.in.(${pIds.join(',')})` : ''}`)
      .eq('is_active', true).order('created_at', { ascending: false });
    if (!data) return;
    const cIds = data.map(c => c.id);
    const creatorIds = [...new Set(data.map(c => c.creator_id))];
    const [partsRes, profilesRes] = await Promise.all([
      supabase.from('challenge_participants').select('*').in('challenge_id', cIds),
      fetchProfiles(creatorIds),
    ]);
    const partsByChallenge = new Map<string, any[]>();
    for (const p of (partsRes.data || [])) {
      if (!partsByChallenge.has(p.challenge_id)) partsByChallenge.set(p.challenge_id, []);
      partsByChallenge.get(p.challenge_id)!.push(p);
    }
    setChallenges(data.map(c => ({ ...c, creator: profilesRes.get(c.creator_id), participants: partsByChallenge.get(c.id) || [] })));
  }

  async function createChallenge(data: { habit_name: string; description: string; emoji: string; duration_days: number; start_date: string }): Promise<string | null> {
    if (!user) return null;
    const endDate = new Date(data.start_date);
    endDate.setDate(endDate.getDate() + data.duration_days);
    const { data: ch, error } = await supabase.from('challenges').insert({ creator_id: user.id, ...data, end_date: endDate.toISOString().split('T')[0] }).select('id').single();
    if (error || !ch) return null;
    await supabase.from('challenge_participants').insert({ challenge_id: ch.id, user_id: user.id });
    await loadChallenges();
    return ch.id;
  }

  async function joinChallenge(challengeId: string) {
    if (!user) return;
    await supabase.from('challenge_participants').insert({ challenge_id: challengeId, user_id: user.id });
    await loadChallenges();
  }

  async function updateChallengeProgress(challengeId: string, progress: number) {
    if (!user) return;
    await supabase.from('challenge_participants').update({ progress, completed_days: progress }).eq('challenge_id', challengeId).eq('user_id', user.id);
    await loadChallenges();
  }

  async function inviteFriendToChallenge(challengeId: string, friendId: string) {
    if (!user) return;
    await sendDM(friendId, `Join my challenge!`, 'challenge', undefined, 'keep', { challengeId });
  }

  // ============================================
  // REACTIONS
  // ============================================
  async function addReaction(targetType: string, targetId: string, emoji: string) {
    if (!user) return;
    await supabase.from('reactions').upsert({ user_id: user.id, target_type: targetType, target_id: targetId, emoji }, { onConflict: 'user_id,target_type,target_id' });
    if (targetType === 'feed') await loadFeed();
  }

  async function removeReaction(targetType: string, targetId: string) {
    if (!user) return;
    await supabase.from('reactions').delete().eq('user_id', user.id).eq('target_type', targetType).eq('target_id', targetId);
    if (targetType === 'feed') await loadFeed();
  }

  // ============================================
  // PROFILE VIEW
  // ============================================
  async function sendEncouragement(friendId: string): Promise<void> {
    if (!user) return;
    const profile = friends.find(f => f.profile?.id === user.id)?.profile;
    const pseudo = profile?.pseudo || 'Someone';
    await sendDM(friendId, `${pseudo} 👏💪🔥`);
  }

  async function loadUserProfile(userId: string): Promise<FriendProfile | null> {
    const { data } = await supabase.from('profiles').select(PROFILE_SELECT).eq('id', userId).single();
    return data as FriendProfile | null;
  }

  async function loadUserBadges(userId: string): Promise<any[]> {
    const { data } = await supabase.from('user_badges').select('*').eq('user_id', userId).order('earned_at', { ascending: false });
    return data || [];
  }

  async function getMutualFriendsCount(userId: string): Promise<number> {
    if (!user) return 0;
    const { data } = await supabase.from('friendships').select('requester_id,addressee_id').eq('status', 'accepted').or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    if (!data) return 0;
    const theirFIds = data.map(f => f.requester_id === userId ? f.addressee_id : f.requester_id);
    return friendIds.filter(id => theirFIds.includes(id)).length;
  }

  // ============================================
  // SEARCH & LEADERBOARD
  // ============================================
  async function searchUsers(query: string): Promise<FriendProfile[]> {
    if (!query.trim() || !user) return [];
    const { data } = await supabase.from('profiles').select(PROFILE_SELECT).ilike('pseudo', `%${query}%`).neq('id', user.id).limit(20);
    return (data || []) as FriendProfile[];
  }

  async function loadLeaderboard() {
    if (!user) return [];
    const allIds = [user.id, ...friendIds];
    const { data } = await supabase.from('profiles').select(PROFILE_SELECT).in('id', allIds).order('xp', { ascending: false });
    return (data || []).map(p => ({ user: p as FriendProfile, xp: p.xp }));
  }

  // ============================================
  // TYPING
  // ============================================
  function sendTypingIndicator(target: string, isGroup = false) {
    if (!user || !channelRef.current) return;
    channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { senderId: user.id, target, isGroup } });
  }

  return (
    <SocialContext.Provider value={{
      friends, pendingRequests, friendIds, isFriend, loadFriends, sendFriendRequest, acceptFriendRequest, declineFriendRequest, blockUser, removeFriend,
      feed, loadFeed, postFeedItem,
      stories, friendStoryGroups, loadStories, postStory, viewStory,
      conversations, loadConversations, loadDMMessages, sendDM, markDMRead,
      groups, loadGroups, createGroup, updateGroup, deleteGroup, leaveGroup, addGroupMember, removeGroupMember, loadGroupMembers, loadGroupMessages, sendGroupMessage, markGroupRead, getGroupRole,
      challenges, loadChallenges, createChallenge, joinChallenge, updateChallengeProgress, inviteFriendToChallenge,
      addReaction, removeReaction,
      sendEncouragement,
      loadUserProfile, loadUserBadges, getMutualFriendsCount,
      searchUsers, loadLeaderboard,
      sendTypingIndicator, typingUsers,
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  return useContext(SocialContext);
}
