import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../contexts/AppContext';

const PRESET_AVATARS: Record<string, string> = {
  fox: '🦊', cat: '🐱', dog: '🐶', panda: '🐼', unicorn: '🦄',
  robot: '🤖', alien: '👽', ghost: '👻', wizard: '🧙', ninja: '🥷',
  lion: '🦁', bear: '🐻', eagle: '🦅', wolf: '🐺', dragon: '🐉',
  owl: '🦉', butterfly: '🦋', rocket: '🚀', star: '⭐', diamond: '💎',
  fire: '🔥', lightning: '⚡', crown: '👑', crystal: '🔮',
};

export function getAvatarDisplay(profile: any): { type: 'image' | 'preset' | 'letter'; value: string } {
  if (profile?.avatar_url) return { type: 'image', value: profile.avatar_url };
  if (profile?.preset_avatar && PRESET_AVATARS[profile.preset_avatar]) return { type: 'preset', value: PRESET_AVATARS[profile.preset_avatar] };
  return { type: 'letter', value: (profile?.pseudo || 'U')[0].toUpperCase() };
}

export { PRESET_AVATARS };

export default function ProfileAvatarButton({ size = 40 }: { size?: number }) {
  const router = useRouter();
  const { profile, theme } = useApp();
  const avatar = getAvatarDisplay(profile);

  return (
    <TouchableOpacity
      onPress={() => router.push('/tabs/profile')}
      activeOpacity={0.7}
    >
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.accent + '30', borderColor: theme.accent }]}>
        {avatar.type === 'image' ? (
          <Image source={{ uri: avatar.value }} style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }} />
        ) : avatar.type === 'preset' ? (
          <Text style={{ fontSize: size * 0.5 }}>{avatar.value}</Text>
        ) : (
          <Text style={[styles.letter, { fontSize: size * 0.4, color: theme.accent }]}>{avatar.value}</Text>
        )}
      </View>
      {profile?.mood_emoji ? (
        <View style={[styles.moodBadge, { backgroundColor: theme.surface }]}>
          <Text style={{ fontSize: 10 }}>{profile.mood_emoji}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  letter: {
    fontWeight: '800',
  },
  moodBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
