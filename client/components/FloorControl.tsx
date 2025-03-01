import { useMap } from '@/modules/map/MapContext';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

export default function FloorControl() {
  const { level, setLevel } = useMap();

  return (
    <View style={styles.controlContainer}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setLevel(level === null ? 0 : level + 1)}>
        <Text style={styles.buttonText}>▲</Text>
      </TouchableOpacity>
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>{level}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setLevel(level === null ? 0 : level - 1)}>
        <Text style={styles.buttonText}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  controlContainer: {
    position: 'absolute',
    top: '50%',
    right: 0,
    margin: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    zIndex: 10,
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
