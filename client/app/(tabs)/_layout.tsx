import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

//keep ../../comp... b/c it is needed to compile on irl iphone
import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MapProvider } from '@/modules/map/MapContext';
import { TaskProvider } from '@/providers/TaskContext';

const TabBarMapIcon = ({ color }: { color: string }) => {
  return (
    <View style={styles.iconContainer}>
      <IconSymbol size={28} name="map.fill" color={color} />
    </View>
  );
};

const TabBarCalendarIcon = ({ color }: { color: string }) => {
  return (
    <View style={styles.iconContainer}>
      <IconSymbol size={28} name="calendar" color={color} />
    </View>
  );
};

const TabBarSettingsIcon = ({ color }: { color: string }) => {
  return (
    <View style={styles.iconContainer}>
      <IconSymbol size={28} name="gear" color={color} />
    </View>
  );
};
const TabBarTaskIcon = ({ color }: { color: string }) => {
  return (
    <View style={styles.iconContainer}>
      <IconSymbol size={28} name="checklist" color={color} />
    </View>
  );
};

const TabLayout = ({ colorScheme }: { colorScheme: 'light' | 'dark' }) => (
  <MapProvider>
    <TaskProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            default: {
              height: 80,
              paddingTop: 5,
              paddingBottom: 20,
            },
          }),
          tabBarItemStyle: {
            height: '100%',
            justifyContent: 'center',
          },
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
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: TabBarTaskIcon,
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
    </TaskProvider>
  </MapProvider>
);

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
});

export default function App() {
  const colorScheme = useColorScheme();
  return <TabLayout colorScheme={colorScheme ?? 'light'} />;
}
