import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

//keep ../../comp... b/c it is needed to compile on irl iphone
import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MapProvider } from '@/modules/map/MapContext';

const TabBarMapIcon = ({ color }: { color: string }) => {
  return <IconSymbol size={28} name="map.fill" color={color} />;
};

const TabBarCalendarIcon = ({ color }: { color: string }) => {
  return <IconSymbol size={28} name="calendar" color={color} />;
};

const TabBarSettingsIcon = ({ color }: { color: string }) => {
  return <IconSymbol size={28} name="gear" color={color} />;
};

const TabLayout = ({ colorScheme }: { colorScheme: 'light' | 'dark' }) => (
  <MapProvider>
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
          title: 'Schedule',
          tabBarIcon: TabBarCalendarIcon,
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: TabBarSettingsIcon,
        }}
      />
    </Tabs>
  </MapProvider>
);

export default function App() {
  const colorScheme = useColorScheme();
  return <TabLayout colorScheme={colorScheme ?? 'light'} />;
}
