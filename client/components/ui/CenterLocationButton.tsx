import React, { useCallback } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMap } from '@/modules/map/MapContext';

const CenterLocationButton = () => {
  const { flyTo, userLocation } = useMap();

  const handlePress = useCallback(() => {
    if (userLocation) {
      flyTo(userLocation.coordinates);
    } else {
      console.error('User location not available');
    }
  }, [userLocation, flyTo]);

  return (
    <TouchableOpacity testID="center-location-button" style={styles.button} onPress={handlePress}>
      <Ionicons name="locate" size={24} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 100,
    right: 36,
    backgroundColor: '#852C3A',
    zIndex: 100,
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CenterLocationButton;
