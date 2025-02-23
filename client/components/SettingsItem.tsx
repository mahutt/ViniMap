import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsItemProps {
  title: string;
  route: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ title, route }) => {
  return (
    <Link href={route as any} asChild>
      <Pressable style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
        <View style={styles.inner}>
          <Text style={styles.title}>{title}</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
    borderRadius: 16,
  },
  inner: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
});

export default SettingsItem;
