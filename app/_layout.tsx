import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../contexts/AppContext';
import { SocialProvider } from '../contexts/SocialContext';
import GDPRModal from '../components/GDPRModal';
import CelebrationOverlay from '../components/CelebrationOverlay';
import UpdateToast from '../components/UpdateToast';
import MoodCheckIn from '../components/MoodCheckIn';

// Register background tasks at module level (required by expo-task-manager)
import '../services/backgroundTasks';
import { defineNotificationBackgroundTask } from '../services/notifications';
defineNotificationBackgroundTask();

// Register Android widget task handler at module level
import { Platform } from 'react-native';
if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('../widgets/OrbitWidget');
    registerWidgetTaskHandler(widgetTaskHandler);
  } catch (e) {
    console.log('[widget] Widget registration skipped:', (e as Error).message);
  }
}

function RootLayoutInner() {
  const { theme, themeMode } = useApp();

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="habits/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habits/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="planner/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="marketplace/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="support/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ai-coach/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="personalization/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="social/friends" options={{ presentation: 'modal' }} />
        <Stack.Screen name="social/stories" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="social/challenges" options={{ presentation: 'modal' }} />
        <Stack.Screen name="social/profile-view" options={{ presentation: 'modal' }} />
        <Stack.Screen name="social/conversations" options={{ presentation: 'modal' }} />
        <Stack.Screen name="social/dm" options={{ presentation: 'modal' }} />
        <Stack.Screen name="social/group-chat" options={{ presentation: 'modal' }} />
        <Stack.Screen name="social/create-group" options={{ presentation: 'modal' }} />
        <Stack.Screen name="social/group-info" options={{ presentation: 'modal' }} />
        <Stack.Screen name="focus" options={{ presentation: 'modal' }} />
        <Stack.Screen name="weekly-report" options={{ presentation: 'modal' }} />
      </Stack>
      <GDPRModal />
      <CelebrationOverlay />
      <UpdateToast />
      <MoodCheckIn />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <SocialProvider>
        <RootLayoutInner />
      </SocialProvider>
    </AppProvider>
  );
}
