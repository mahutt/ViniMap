import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapState, useMap } from '@/modules/map/MapContext';
import LocationInput from '@/components/LocationInput';

export function InputFields() {
  const { setState, startLocation, setStartLocation, endLocation, setEndLocation } = useMap();

  const swapLocations = () => {
    setStartLocation(endLocation);
    setEndLocation(startLocation);
  };

  return (
    <>
      <View style={styles.locationRangeFormRow}>
        <LocationInput
          location={startLocation}
          setLocation={setStartLocation}
          ionIconName="pin-outline"
          placeholder="Start location"
        />
        <Pressable onPress={() => setState(MapState.Idle)}>
          <Ionicons name="close-outline" size={28} color="#666" />
        </Pressable>
      </View>

      <View style={styles.locationRangeFormRow}>
        <LocationInput
          location={endLocation}
          setLocation={setEndLocation}
          ionIconName="pin"
          placeholder="End location"
        />
        <Pressable onPress={swapLocations}>
          <Ionicons name="swap-vertical-outline" size={28} color="#666" />
        </Pressable>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  locationRangeFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export default InputFields;
