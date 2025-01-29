import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const TabLayout = ({ colorScheme }: { colorScheme: 'light' | 'dark' }) => (
  <Tabs
    screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarBackground: TabBarBackground,
      tabBarStyle: Platform.select({
        ios: {
          position: 'absolute',
        },
        default: {},
      }),
    }}>
    <Tabs.Screen
      name="index"
      options={{
        title: 'Map',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
      }}
    />
    <Tabs.Screen
      name="calendar"
      options={{
        title: 'Calendar',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
      }}
    />
  </Tabs>
);

export default function App() {
  const colorScheme = useColorScheme();
  return <TabLayout colorScheme={colorScheme ?? 'light'} />;
}
