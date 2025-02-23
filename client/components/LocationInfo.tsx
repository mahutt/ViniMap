import { MapState, useMap } from '@/modules/map/MapContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import CoordinateService from '@/Services/CoordinateService';

export function LocationInfo() {
  const { setState, endLocation } = useMap();

  function getDirections() {
    setState(MapState.RoutePlanning);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => setState(MapState.Idle)}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
      <Text style={styles.nameText}>{endLocation?.name}</Text>
      <Text style={styles.addressText}>{endLocation?.data?.address}</Text>
      <Text style={[styles.isOpen, { color: endLocation?.data?.isOpen ? 'green' : 'red' }]}>
        {endLocation?.data?.isOpen ? 'Open Now' : 'Closed Now'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={getDirections}>
        <Ionicons name="arrow-forward-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.text}>Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ccc',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'black',
    fontSize: 20,
    lineHeight: 20,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  addressText: {
    fontSize: 16,
    color: 'gray',
  },
  isOpen: {
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#852C3A',
    paddingVertical: '3%',
    paddingHorizontal: '5%',
    borderRadius: 25,
    justifyContent: 'center',
    marginTop: '8%',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
