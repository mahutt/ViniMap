import { useMap } from '@/modules/map/MapContext';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';

export default function FloorControl() {
  const { level, setLevel, indoorMap } = useMap();

  if (indoorMap === null || level === null) {
    return null;
  }

  const handleLevelChange = (level: number) => {
    if (level < indoorMap.levelsRange.min || level > indoorMap.levelsRange.max) {
      return;
    }
    setLevel(level);
  };

  const atMaxLevel = level === indoorMap.levelsRange.max;
  const atMinLevel = level === indoorMap.levelsRange.min;

  return (
    <View style={styles.controlContainer}>
      <TouchableOpacity
        disabled={atMaxLevel}
        style={{ ...styles.button, paddingTop: 10, opacity: atMaxLevel ? 0.3 : 1 }}
        onPress={() => handleLevelChange(level + 1)}>
        <IconSymbol name="chevron.up" size={20} color="#912338" />
      </TouchableOpacity>
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>{level}</Text>
      </View>
      <TouchableOpacity
        disabled={atMinLevel}
        style={{ ...styles.button, paddingBottom: 10, opacity: atMinLevel ? 0.3 : 1 }}
        onPress={() => handleLevelChange(level - 1)}>
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
