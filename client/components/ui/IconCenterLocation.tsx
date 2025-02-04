import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importing icon library
import { useState, useEffect } from 'react';
import { MapState, useMap } from '@/modules/map/MapContext';
import * as Location from 'expo-location';


const ButtonComponent = () => {

var currentLongitude = 0;
var currentLatitude = 0;

const {flyTo} = useMap();

        const  getPermissions = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              console.log("Please grant location permissions");
              return;
            }
            let currentLocation = await Location.getCurrentPositionAsync({});

            currentLatitude = currentLocation.coords.latitude;
            currentLongitude = currentLocation.coords.longitude;
            
            console.log(currentLatitude);
            console.log(currentLongitude)
            console.log(currentLocation);
            
        }

const {centerCoordinate,setCenterCoordinate} = useMap();
    

const handlePress = async () => {
    // Wait for getPermissions to complete before executing the following code
    await getPermissions(); 

    // Once permissions are granted and location is retrieved, move the map
    console.log("Coordinates:", currentLatitude, currentLongitude);

    // Set the center of the map and fly to the new coordinates
    setCenterCoordinate([currentLatitude, currentLongitude]);
    flyTo([currentLongitude, currentLatitude]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Ionicons name="locate" size={24} color="white" /> {/* Icon to represent location */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // ✅ Make the position absolute
    top: 700,              // Adjust the position from the top
    right: 0,             // Adjust the position from the left
    backgroundColor: '#852C3A',
    zIndex: 100,
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center', // Center the icon horizontally
    justifyContent: 'center', // Center the icon vertically
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ButtonComponent;
