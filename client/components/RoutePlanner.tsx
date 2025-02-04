import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapState, useMap } from '@/modules/map/MapContext';

export function RoutePlanner() {
  const { setState } = useMap();
  const [startLocationString, setStartLocationString] = React.useState<string>('');
  const [endLocationString, setEndLocationString] = React.useState<string>('');
  const swapLocations = () => {
    setStartLocationString(endLocationString);
    setEndLocationString(startLocationString);
  };
  return (
    <View style={styles.locationRangeForm}>
      <View style={styles.locationRangeFormRow}>
        <View style={styles.locationInputContainer}>
          <Ionicons name="pin-outline" size={16} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Start location"
            placeholderTextColor="#666"
            value={startLocationString}
            onChangeText={(query) => setStartLocationString(query)}
          />
        </View>
        <Pressable onPress={() => setState(MapState.Idle)}>
          <Ionicons name="close-outline" size={28} color="#666" />
        </Pressable>
      </View>
      <View style={styles.locationRangeFormRow}>
        <View style={styles.locationInputContainer}>
          <Ionicons name="pin" size={16} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="End location"
            placeholderTextColor="#666"
            value={endLocationString}
            onChangeText={(query) => setEndLocationString(query)}
          />
        </View>
        <Pressable onPress={swapLocations}>
          <Ionicons name="swap-vertical-outline" size={28} color="#666" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  locationRangeForm: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  locationRangeFormRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInputContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
});
