import { useMap } from '@/modules/map/MapContext';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';

export default function FloorControl() {
  const { level, setLevel } = useMap();

  return (
    <View style={styles.controlContainer}>
      <TouchableOpacity
        style={{ ...styles.button, paddingTop: 10 }}
        onPress={() => setLevel(level === null ? 0 : level + 1)}>
        <IconSymbol name="chevron.up" size={20} color="#912338" />
      </TouchableOpacity>
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>{level}</Text>
      </View>
      <TouchableOpacity
        style={{ ...styles.button, paddingBottom: 10 }}
        onPress={() => setLevel(level === null ? 0 : level - 1)}>
        <IconSymbol name="chevron.down" size={20} color="#912338" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  controlContainer: {
    position: 'absolute',
    top: '25%',
    right: 36,

    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#912338',
    zIndex: 10,
  },
  button: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  levelContainer: {
    width: 50,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: '#912338',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
