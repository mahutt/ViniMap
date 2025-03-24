import { MapState, useMap } from '@/modules/map/MapContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { POIType } from '../modules/map/PointsOfInterestTypes';

const iconMap: Record<POIType, keyof typeof Ionicons.glyphMap> = {
  bixi: 'bicycle-outline',
  metro: 'subway-outline',
  bus_station: 'bus-outline',
  restaurant: 'restaurant-outline',
  park: 'leaf-outline',
  library: 'book-outline',
  shopping: 'cart-outline',
  other: 'location-outline',
};

export function LocationInfo() {
  const { setState, endLocation } = useMap();

  function getDirections() {
    setState(MapState.RoutePlanning);
  }

  const isCustomPOI = endLocation?.data?.hours !== undefined;

  const poiType = isCustomPOI ? endLocation?.data?.type || 'other' : 'other';
  const iconName = iconMap[poiType as POIType] || 'location';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => setState(MapState.Idle)}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      <View style={styles.headerContainer}>
        {isCustomPOI && (
          <Ionicons name={iconName} size={24} color="#852C3A" style={styles.poiIcon} />
        )}
        <Text style={styles.nameText}>{endLocation?.name}</Text>
      </View>

      <Text style={styles.addressText}>{endLocation?.data?.address}</Text>

      <Text style={[styles.isOpen, { color: endLocation?.data?.isOpen ? 'green' : 'red' }]}>
        {endLocation?.data?.isOpen ? 'Open Now' : 'Closed Now'}
      </Text>

      {isCustomPOI && endLocation?.data?.hours && (
        <Text style={styles.hoursText}>Hours: {endLocation.data.hours}</Text>
      )}

      {isCustomPOI && endLocation?.data?.description && (
        <Text style={styles.descriptionText}>{endLocation.data.description}</Text>
      )}

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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  poiIcon: {
    marginRight: 10,
  },
  hoursText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    marginBottom: 10,
  },
});
