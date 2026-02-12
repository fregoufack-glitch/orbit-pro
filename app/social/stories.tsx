import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, Animated, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { useSocial, Story } from '../../contexts/SocialContext';
import { getAvatarDisplay } from '../../components/ProfileAvatarButton';

const { width, height } = Dimensions.get('window');

export default function StoriesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; mode?: string }>();
  const { theme, profile, language } = useApp();
  const { friendStoryGroups, stories, viewStory, postStory } = useSocial();

  const [mode, setMode] = useState<'view' | 'post'>(params.mode === 'post' ? 'post' : 'view');
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [caption, setCaption] = useState('');
  const progress = useRef(new Animated.Value(0)).current;

  // Find the starting group
  useEffect(() => {
    if (params.userId) {
      const idx = friendStoryGroups.findIndex(g => g.userId === params.userId);
      if (idx >= 0) setCurrentGroupIdx(idx);
    }
  }, [params.userId]);

  const currentGroup = friendStoryGroups[currentGroupIdx];
  const currentStory = currentGroup?.stories[currentStoryIdx];

  // Auto-advance stories
  useEffect(() => {
    if (mode !== 'view' || !currentStory) return;

    viewStory(currentStory.id);
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) nextStory();
    });
    return () => anim.stop();
  }, [currentGroupIdx, currentStoryIdx, mode]);

  function nextStory() {
    if (!currentGroup) return;
    if (currentStoryIdx < currentGroup.stories.length - 1) {
      setCurrentStoryIdx(currentStoryIdx + 1);
    } else if (currentGroupIdx < friendStoryGroups.length - 1) {
      setCurrentGroupIdx(currentGroupIdx + 1);
      setCurrentStoryIdx(0);
    } else {
      router.back();
    }
  }

  function prevStory() {
    if (currentStoryIdx > 0) {
      setCurrentStoryIdx(currentStoryIdx - 1);
    } else if (currentGroupIdx > 0) {
      setCurrentGroupIdx(currentGroupIdx - 1);
      setCurrentStoryIdx(0);
    }
  }

  async function handlePost() {
    await postStory(null, caption || (language === 'fr' ? '✨ Moment capturé' : '✨ Moment captured'));
    router.back();
  }

  // POST MODE
  if (mode === 'post') {
    return (
      <View style={[styles.container, { backgroundColor: '#0A0A0F' }]}>
        <View style={styles.postHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.postTitle}>{language === 'fr' ? 'Nouvelle story' : 'New Story'}</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.postContent}>
          <View style={[styles.storyPreview, { backgroundColor: theme.accent + '10', borderColor: theme.accent }]}>
            <Text style={styles.storyPreviewEmoji}>📸</Text>
            <TextInput
              style={[styles.captionInput, { color: '#FFF' }]}
              value={caption}
              onChangeText={setCaption}
              placeholder={language === 'fr' ? 'Ajoutez une légende...' : 'Add a caption...'}
              placeholderTextColor="#8B95B0"
              multiline
              maxLength={150}
            />
          </View>

          <Text style={styles.storyHint}>
            {language === 'fr' ? '💡 Partagez votre progression avec vos amis !' : '💡 Share your progress with friends!'}
          </Text>
        </View>

        <TouchableOpacity style={[styles.postBtn, { backgroundColor: theme.accent }]} onPress={handlePost}>
          <Text style={styles.postBtnText}>{language === 'fr' ? 'Publier la story' : 'Post Story'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // VIEW MODE
  if (!currentGroup || !currentStory) {
    return (
      <View style={[styles.container, { backgroundColor: '#0A0A0F', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyText}>{language === 'fr' ? 'Aucune story' : 'No stories'}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: theme.accent }]}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatar = getAvatarDisplay(currentGroup.user);
  const progressWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.container, { backgroundColor: '#0A0A0F' }]}>
      {/* Progress bars */}
      <View style={styles.progressRow}>
        {currentGroup.stories.map((_, i) => (
          <View key={i} style={[styles.progressBg, { backgroundColor: '#FFF3' }]}>
            {i < currentStoryIdx ? (
              <View style={[styles.progressFill, { backgroundColor: '#FFF', width: '100%' }]} />
            ) : i === currentStoryIdx ? (
              <Animated.View style={[styles.progressFill, { backgroundColor: '#FFF', width: progressWidth }]} />
            ) : null}
          </View>
        ))}
      </View>

      {/* User info */}
      <View style={styles.storyHeader}>
        <View style={[styles.storyAvatar, { backgroundColor: (currentGroup.user.accent_color || theme.accent) + '40' }]}>
          <Text style={{ fontSize: 20 }}>{avatar.type === 'preset' ? avatar.value : avatar.value}</Text>
        </View>
        <Text style={styles.storyUsername}>{currentGroup.user.pseudo}</Text>
        <Text style={styles.storyTime}>
          {Math.floor((Date.now() - new Date(currentStory.created_at).getTime()) / 3600000)}h
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.storyClose}>
          <Text style={styles.storyCloseText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Story content */}
      <View style={styles.storyBody}>
        {currentStory.image_url ? (
          <Image source={{ uri: currentStory.image_url }} style={styles.storyImage} resizeMode="cover" />
        ) : (
          <View style={[styles.storyTextContent, { backgroundColor: (currentGroup.user.accent_color || theme.accent) + '20' }]}>
            <Text style={styles.storyCaption}>{currentStory.caption}</Text>
          </View>
        )}
      </View>

      {/* Tap zones */}
      <View style={styles.tapZones}>
        <TouchableOpacity style={styles.tapLeft} onPress={prevStory} />
        <TouchableOpacity style={styles.tapRight} onPress={nextStory} />
      </View>

      {/* View count (if own story) */}
      {currentStory.user_id === profile?.id && (
        <View style={styles.viewCount}>
          <Text style={styles.viewCountText}>👁️ {currentStory.view_count}</Text>
        </View>
      )}
    </View>
  );
}

function t(key: string) {
  // Simple fallback
  const map: Record<string, string> = { 'common.back': 'Back' };
  return map[key] || key;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Progress
  progressRow: { flexDirection: 'row', paddingHorizontal: 8, paddingTop: 56, gap: 4 },
  progressBg: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  // Header
  storyHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  storyAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  storyUsername: { color: '#FFF', fontSize: 15, fontWeight: '700', flex: 1 },
  storyTime: { color: '#FFF8', fontSize: 13 },
  storyClose: { padding: 8 },
  storyCloseText: { color: '#FFF', fontSize: 20 },
  // Body
  storyBody: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  storyImage: { width: width - 40, height: height * 0.6, borderRadius: 20 },
  storyTextContent: { width: width - 40, padding: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  storyCaption: { color: '#FFF', fontSize: 24, fontWeight: '700', textAlign: 'center', lineHeight: 36 },
  // Tap zones
  tapZones: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', top: 100 },
  tapLeft: { flex: 1 },
  tapRight: { flex: 2 },
  // View count
  viewCount: { position: 'absolute', bottom: 40, left: 20 },
  viewCountText: { color: '#FFF8', fontSize: 14 },
  // Post mode
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  closeBtn: { color: '#FFF', fontSize: 22, fontWeight: '600' },
  postTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  postContent: { flex: 1, padding: 20, justifyContent: 'center' },
  storyPreview: { borderRadius: 20, padding: 30, borderWidth: 2, minHeight: 300, alignItems: 'center', justifyContent: 'center' },
  storyPreviewEmoji: { fontSize: 48, marginBottom: 16 },
  captionInput: { fontSize: 20, textAlign: 'center', fontWeight: '600', width: '100%' },
  storyHint: { color: '#8B95B0', fontSize: 14, textAlign: 'center', marginTop: 16 },
  postBtn: { marginHorizontal: 20, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  postBtnText: { color: '#0A0E1A', fontSize: 17, fontWeight: '700' },
  emptyText: { color: '#8B95B0', fontSize: 18, marginBottom: 16 },
  backLink: { fontSize: 16, fontWeight: '600' },
});
