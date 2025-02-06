import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapState, useMap } from '@/modules/map/MapContext';
import LocationInput from './LocationInput';

export function RoutePlanner() {
  const {
    setState,
    loadRouteFromCoordinates,
    startLocation,
    setStartLocation,
    endLocation,
    setEndLocation,
  } = useMap();

  useEffect(() => {
    if (endLocation && !startLocation) {
    }
  }, [endLocation, startLocation]);

  useEffect(() => {
    if (startLocation && endLocation) {
      loadRouteFromCoordinates(startLocation.coordinates, endLocation.coordinates);
    }
  }, [startLocation, endLocation]);

  const swapLocations = () => {
    setStartLocation(endLocation);
    setEndLocation(startLocation);
  };

  return (
    <View style={styles.locationRangeForm}>
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
});
