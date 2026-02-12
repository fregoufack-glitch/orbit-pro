-- Orbit Pro - Supabase Schema (Complete)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudo TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  custom_title TEXT DEFAULT '',
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  accent_color TEXT DEFAULT '#00D9A5',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  gdpr_consent BOOLEAN DEFAULT FALSE,
  gdpr_consent_date TIMESTAMPTZ,
  notification_enabled BOOLEAN DEFAULT FALSE,
  notification_time TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  -- Ultra personalization
  bio TEXT DEFAULT '' CHECK (char_length(bio) <= 150),
  mood_emoji TEXT DEFAULT '',
  mood_text TEXT DEFAULT '',
  banner_url TEXT,
  banner_gradient TEXT DEFAULT 'none',
  display_name_style TEXT DEFAULT 'normal' CHECK (display_name_style IN ('normal', 'bold', 'italic')),
  badge_showcase JSONB DEFAULT '[]'::jsonb,
  streak_style TEXT DEFAULT 'flame' CHECK (streak_style IN ('flame', 'lightning', 'star', 'diamond')),
  card_style TEXT DEFAULT 'detailed' CHECK (card_style IN ('minimal', 'detailed', 'compact', 'large')),
  animation_style TEXT DEFAULT 'bouncy' CHECK (animation_style IN ('bouncy', 'smooth', 'snappy', 'none')),
  profile_theme TEXT DEFAULT 'neon_green',
  notification_sound TEXT DEFAULT 'default',
  widget_style TEXT DEFAULT 'standard' CHECK (widget_style IN ('standard', 'compact', 'detailed', 'minimal')),
  preset_avatar TEXT DEFAULT '',
  privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'friends', 'private')),
  habit_card_style TEXT DEFAULT 'detailed' CHECK (habit_card_style IN ('minimal', 'detailed', 'compact', 'large')),
  objectives TEXT[] DEFAULT '{}',
  -- Streak freeze
  streak_freezes_available INTEGER DEFAULT 1,
  streak_freeze_used_at TIMESTAMPTZ,
  -- Quiet hours
  quiet_hours_start TIME DEFAULT '23:00',
  quiet_hours_end TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HABITS
-- ============================================
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '⭐',
  color TEXT DEFAULT '#00D9A5',
  category TEXT DEFAULT 'general',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
  custom_days INTEGER[] DEFAULT '{}',
  target_time TIME,
  duration_minutes INTEGER DEFAULT 0,
  reminder_enabled BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_habits_user ON habits(user_id);

-- ============================================
-- HABIT COMPLETIONS
-- ============================================
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  xp_earned INTEGER DEFAULT 10,
  snap_url TEXT, -- photo proof of habit completion
  UNIQUE(habit_id, completed_date)
);
CREATE INDEX idx_completions_user_date ON habit_completions(user_id, completed_date);

-- ============================================
-- PLANNED ACTIVITIES
-- ============================================
CREATE TABLE planned_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  color TEXT DEFAULT '#00D9A5',
  emoji TEXT DEFAULT '📋',
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_activities_user_date ON planned_activities(user_id, date);

-- ============================================
-- USER BADGES
-- ============================================
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_emoji TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
CREATE INDEX idx_badges_user ON user_badges(user_id);

-- ============================================
-- DAILY STATS
-- ============================================
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  habits_completed INTEGER DEFAULT 0,
  habits_total INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  perfect_day BOOLEAN DEFAULT FALSE,
  missions_completed INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  mood_emoji TEXT,
  mood_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);

-- ============================================
-- FRIENDSHIPS
-- ============================================
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  friend_streak INTEGER DEFAULT 0,
  last_interaction_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- ============================================
-- SOCIAL FEED
-- ============================================
CREATE TABLE social_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('achievement', 'streak', 'level_up', 'perfect_day', 'badge', 'story', 'challenge_complete')),
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX idx_feed_user ON social_feed(user_id);
CREATE INDEX idx_feed_created ON social_feed(created_at DESC);

-- ============================================
-- STORIES (24h expiry)
-- ============================================
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  caption TEXT DEFAULT '',
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);
CREATE INDEX idx_stories_user ON stories(user_id);
CREATE INDEX idx_stories_expires ON stories(expires_at);

-- ============================================
-- STORY VIEWS
-- ============================================
CREATE TABLE story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- ============================================
-- MESSAGES (Snapchat-style)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'snap', 'achievement_share', 'challenge')),
  expire_mode TEXT DEFAULT '24h' CHECK (expire_mode IN ('viewed', '24h', 'keep')),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC);

-- ============================================
-- CHALLENGES
-- ============================================
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  emoji TEXT DEFAULT '🎯',
  duration_days INTEGER NOT NULL DEFAULT 30,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_challenges_creator ON challenges(creator_id);

-- ============================================
-- CHALLENGE PARTICIPANTS
-- ============================================
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed_days INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);
CREATE INDEX idx_challenge_participants ON challenge_participants(challenge_id);

-- ============================================
-- REACTIONS
-- ============================================
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('feed', 'story', 'message', 'challenge')),
  target_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);
CREATE INDEX idx_reactions_target ON reactions(target_type, target_id);

-- ============================================
-- GROUPS (Snapchat-style group chats)
-- ============================================
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '👥',
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_groups_creator ON groups(creator_id);

-- ============================================
-- GROUP MEMBERS
-- ============================================
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  muted BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- ============================================
-- GROUP MESSAGES
-- ============================================
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  image_url TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'snap', 'achievement', 'challenge', 'system')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_group_messages_group ON group_messages(group_id, created_at DESC);
CREATE INDEX idx_group_messages_sender ON group_messages(sender_id);

-- ============================================
-- GROUP MESSAGE READ RECEIPTS
-- ============================================
CREATE TABLE group_message_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FOCUS SESSIONS
-- ============================================
CREATE TABLE focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_focus_sessions_user ON focus_sessions(user_id);

-- ============================================
-- ENCOURAGEMENTS
-- ============================================
CREATE TABLE encouragements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_encouragements_receiver ON encouragements(receiver_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_message_reads ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read public profiles, update own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Public profiles visible" ON profiles FOR SELECT USING (privacy = 'public');
CREATE POLICY "Friends can view profiles" ON profiles FOR SELECT USING (
  privacy IN ('public', 'friends') AND (
    EXISTS (SELECT 1 FROM friendships WHERE status = 'accepted' AND (
      (requester_id = auth.uid() AND addressee_id = id) OR
      (addressee_id = auth.uid() AND requester_id = id)
    ))
  )
);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING (auth.uid() = id);

-- Habits
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- Completions
CREATE POLICY "Users can view own completions" ON habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own completions" ON habit_completions FOR DELETE USING (auth.uid() = user_id);

-- Activities
CREATE POLICY "Users can view own activities" ON planned_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON planned_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON planned_activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON planned_activities FOR DELETE USING (auth.uid() = user_id);

-- Badges
CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Friends can see badges too
CREATE POLICY "Friends can view badges" ON user_badges FOR SELECT USING (
  EXISTS (SELECT 1 FROM friendships WHERE status = 'accepted' AND (
    (requester_id = auth.uid() AND addressee_id = user_id) OR
    (addressee_id = auth.uid() AND requester_id = user_id)
  ))
);

-- Daily stats
CREATE POLICY "Users can view own stats" ON daily_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON daily_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON daily_stats FOR UPDATE USING (auth.uid() = user_id);

-- Friendships: both parties can see
CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can create friendship requests" ON friendships FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update friendships they're part of" ON friendships FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "Users can delete friendships they're part of" ON friendships FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Social feed: friends can see
CREATE POLICY "Users can view own feed" ON social_feed FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Friends can view feed" ON social_feed FOR SELECT USING (
  EXISTS (SELECT 1 FROM friendships WHERE status = 'accepted' AND (
    (requester_id = auth.uid() AND addressee_id = user_id) OR
    (addressee_id = auth.uid() AND requester_id = user_id)
  ))
);
CREATE POLICY "Users can insert own feed" ON social_feed FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Stories
CREATE POLICY "Users can view active stories from friends" ON stories FOR SELECT USING (
  expires_at > NOW() AND (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM friendships WHERE status = 'accepted' AND (
      (requester_id = auth.uid() AND addressee_id = user_id) OR
      (addressee_id = auth.uid() AND requester_id = user_id)
    ))
  )
);
CREATE POLICY "Users can insert own stories" ON stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = user_id);

-- Story views
CREATE POLICY "Story owners can see views" ON story_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM stories WHERE id = story_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert story views" ON story_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Messages: sender and receiver, ONLY between accepted friends
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send DMs to friends only" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM friendships WHERE status = 'accepted' AND (
    (requester_id = auth.uid() AND addressee_id = receiver_id) OR
    (addressee_id = auth.uid() AND requester_id = receiver_id)
  ))
);
CREATE POLICY "Users can update messages they received" ON messages FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY "Users can delete messages" ON messages FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Groups: members can see
CREATE POLICY "Group members can view groups" ON groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = id AND user_id = auth.uid())
);
CREATE POLICY "Users can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Group admins can update" ON groups FOR UPDATE USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = id AND user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Group creator can delete" ON groups FOR DELETE USING (auth.uid() = creator_id);

-- Group members
CREATE POLICY "Members can view group members" ON group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid())
);
CREATE POLICY "Admins can add members" ON group_members FOR INSERT WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_members.group_id AND user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can remove members" ON group_members FOR DELETE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin')
);
CREATE POLICY "Members can update own membership" ON group_members FOR UPDATE USING (user_id = auth.uid());

-- Group messages
CREATE POLICY "Members can view group messages" ON group_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);
CREATE POLICY "Members can send group messages" ON group_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_messages.group_id AND user_id = auth.uid())
);

-- Group message reads
CREATE POLICY "Members can view reads" ON group_message_reads FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_id = group_message_reads.group_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own read status" ON group_message_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own read" ON group_message_reads FOR UPDATE USING (auth.uid() = user_id);

-- Challenges
CREATE POLICY "Users can view challenges they participate in" ON challenges FOR SELECT USING (
  creator_id = auth.uid() OR
  EXISTS (SELECT 1 FROM challenge_participants WHERE challenge_id = id AND user_id = auth.uid())
);
CREATE POLICY "Users can create challenges" ON challenges FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update challenges" ON challenges FOR UPDATE USING (auth.uid() = creator_id);

-- Challenge participants
CREATE POLICY "Participants can view" ON challenge_participants FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM challenges WHERE id = challenge_id AND creator_id = auth.uid())
);
CREATE POLICY "Users can join challenges" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON challenge_participants FOR UPDATE USING (auth.uid() = user_id);

-- Reactions
CREATE POLICY "Users can view reactions" ON reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Focus sessions
CREATE POLICY "Users can view own focus sessions" ON focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own focus sessions" ON focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Encouragements
CREATE POLICY "Users can view received encouragements" ON encouragements FOR SELECT USING (auth.uid() = receiver_id OR auth.uid() = sender_id);
CREATE POLICY "Users can send encouragements" ON encouragements FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ============================================
-- FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON planned_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-delete expired stories (run via pg_cron or Supabase Edge Function)
-- SELECT cron.schedule('cleanup-expired-stories', '0 * * * *', $$DELETE FROM stories WHERE expires_at < NOW()$$);

-- ============================================
-- REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
ALTER PUBLICATION supabase_realtime ADD TABLE habit_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE planned_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE user_badges;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE social_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE focus_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE encouragements;
ALTER PUBLICATION supabase_realtime ADD TABLE groups;
ALTER PUBLICATION supabase_realtime ADD TABLE group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE group_message_reads;
