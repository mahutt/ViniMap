import { StyleSheet, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { useMap } from './MapContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function PitchButton() {
  const { pitchLevel, setPitchLevel, setZoomLevel, setCenterCoordinate, mapRef } = useMap();

  const pressHandler = async () => {
    const currentZoom = (await mapRef.current?.getZoom()) as number;
    const currentCoordinates = (await mapRef.current?.getCenter()) as [number, number];
    setCenterCoordinate(currentCoordinates);
    setZoomLevel(currentZoom);
    const newPitch = pitchLevel == 75 ? 0 : 75;
    setPitchLevel(newPitch);
  };
  return (
    <View style={styles.pitchButtonContainer}>
      <TouchableOpacity onPress={pressHandler}>
        <MaterialCommunityIcons name="angle-obtuse" size={35} color="white" />
      </TouchableOpacity>
    </View>
  ;
    // The above error (missing parenthesis) is introduced to test our CI/CD pipeline
}

const styles = StyleSheet.create({
  pitchButtonContainer: {
    top: 130,
    right: 36,
    position: 'absolute',
    zIndex: 2,
    backgroundColor: '#912338',
    borderRadius: 50,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.89,
  },
});
