import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMap } from '@/modules/map/MapContext';
import * as Location from 'expo-location';

const CenterLocationComponent = () => {
  let currentLongitude = 0;
  let currentLatitude = 0;
  const { flyTo } = useMap();
  const getPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Please grant location permissions');
      return;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    currentLatitude = currentLocation.coords.latitude;
    currentLongitude = currentLocation.coords.longitude;
  };
  const { setCenterCoordinate } = useMap();
  const handlePress = async () => {
    await getPermissions();
    setCenterCoordinate([currentLatitude, currentLongitude]);
    flyTo([currentLongitude, currentLatitude]);
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
