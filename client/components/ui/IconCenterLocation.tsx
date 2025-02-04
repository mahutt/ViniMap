import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importing icon library
import { useState, useEffect } from 'react';
import { useMap } from '@/modules/map/MapContext';



const ButtonComponent = () => {

const {centerCoordinate,setCenterCoordinate} = useMap();
  const handlePress = () => {

    setCenterCoordinate([-73.86102241473235,45.447682764617575]);
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
