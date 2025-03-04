import React from 'react';
import { TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMap } from '@/modules/map/MapContext';
import CoordinateService from '@/services/CoordinateService';

const CenterLocationComponent = () => {
  const { flyTo, setCenterCoordinate } = useMap();

  const handlePress = async () => {
    try {
      const coordinates = await CoordinateService.getCurrentCoordinates();
      const mapboxCoordinates: [number, number] = [coordinates[1], coordinates[0]];

      setCenterCoordinate(mapboxCoordinates);
      flyTo(mapboxCoordinates);
    } catch (error) {
      Alert.alert('Location Error', 'Cannot fetch location');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
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
