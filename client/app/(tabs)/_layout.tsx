import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const TabBarMapIcon = ({ color }: { color: string }) => {
  return <IconSymbol size={28} name="map.fill" color={color} />;
};

const TabBarCalendarIcon = ({ color }: { color: string }) => {
  return <IconSymbol size={28} name="calendar" color={color} />;
};

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
        tabBarIcon: TabBarMapIcon,
      }}
    />
    <Tabs.Screen
      name="calendar"
      options={{
        title: 'Calendar',
        tabBarIcon: TabBarCalendarIcon,
      }}
    />
  </Tabs>
);

export default function App() {
  const colorScheme = useColorScheme();
  return <TabLayout colorScheme={colorScheme ?? 'light'} />;
}
