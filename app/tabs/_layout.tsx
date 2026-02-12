import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { t } from '../../i18n';
import AICoachButton from '../../components/AICoachButton';

function TabIcon({ emoji, focused, color }: { emoji: string; focused: boolean; color: string }) {
  return (
    <View style={[styles.tabIcon, focused && { backgroundColor: color + '20' }]}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.5 }]}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { theme, profile } = useApp();
  const router = useRouter();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            height: 85,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('tab.home'),
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} color={theme.accent} />,
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: t('tab.habits'),
            tabBarIcon: ({ focused }) => <TabIcon emoji="✅" focused={focused} color={theme.accent} />,
          }}
        />
        <Tabs.Screen
          name="social"
          options={{
            title: 'Social',
            tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} color={theme.accent} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: t('tab.stats'),
            tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} color={theme.accent} />,
          }}
        />
        <Tabs.Screen
          name="planner"
          options={{
            title: t('tab.planner'),
            tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} color={theme.accent} />,
          }}
        />
        {/* Profile is hidden from tabs — accessed via avatar in header */}
        <Tabs.Screen
          name="profile"
          options={{
            href: null, // hidden from tab bar
          }}
        />
      </Tabs>
      <AICoachButton />
    </>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 20,
  },
});
