import React, { useCallback } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMap } from '@/modules/map/MapContext';

const CenterLocationComponent = () => {
  const { flyTo, userLocation } = useMap();

  const handlePress = useCallback(() => {
    if (userLocation) {
      flyTo(userLocation.coordinates);
    } else {
      console.error('User location not available');
    }
  }, [userLocation, flyTo]);

  return (
    <View style={styles.container}>
      <TouchableOpacity testID="center-location-button" style={styles.button} onPress={handlePress}>
        <Ionicons name="locate" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CenterLocationComponent;
