/**
 * Tabs layout with bottom navigation
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.surface,
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: () => <></>,
        }}
      />
      <Tabs.Screen
        name="hospitals"
        options={{
          title: '병원',
          tabBarIcon: () => <></>,
        }}
      />
      <Tabs.Screen
        name="pets/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
