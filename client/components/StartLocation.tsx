import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapState, useMap } from '@/modules/map/MapContext';

export function StartLocationSelector({ onClose }: { onClose: () => void }) {
  const { setState } = useMap();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.option}
        onPress={() => {
          setState(MapState.SelectingStartLocation);
          onClose();
        }}>
        <Ionicons name="map-outline" size={24} color="#666" />
        <Text style={styles.optionText}>Choose on map</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={onClose}>
        <Ionicons name="search-outline" size={24} color="#666" />
        <Text style={styles.optionText}>Search location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
  },
});
