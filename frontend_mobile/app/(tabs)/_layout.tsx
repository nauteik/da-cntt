import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab, IconSymbol } from '@/src/components';
import { Colors } from '@/src/constants';
import { useColorScheme } from '@/src/hooks';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[(colorScheme ?? 'light') as 'light' | 'dark'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="unscheduled"
        options={{
          title: 'Unscheduled',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="plus.circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape" color={color} />,
        }}
      />
    </Tabs>
  );
}
