import { MapState, useMap } from '@/modules/map/MapContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  bicycle_rental: 'bicycle-outline',
  subway_station: 'subway-outline',
  bus_station: 'bus-outline',
  restaurant: 'restaurant-outline',
  park: 'leaf-outline',
  library: 'book-outline',
  location: 'location-outline',
  university: 'school-outline',
};

export function LocationInfo() {
  const { setState, endLocation } = useMap();

  function getDirections() {
    setState(MapState.RoutePlanning);
  }

  const isCustomPOI = endLocation?.data?.hours !== undefined;
  const iconName = iconMap[endLocation?.data?.type] || 'location';

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.nameText}>{endLocation?.name}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setState(MapState.Idle)}
          testID="close-button">
          <Text style={styles.closeText}>
            <IconSymbol name="xmark" size={15} color="#333" />
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {isCustomPOI && <Ionicons name={iconName} size={16} color="#852C3A" />}
        {isCustomPOI && endLocation?.data?.description && (
          <Text style={styles.descriptionText}>{endLocation.data.description}</Text>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={[styles.isOpen, { color: endLocation?.data?.isOpen ? 'green' : 'red' }]}>
          {endLocation?.data?.isOpen ? 'Open Now' : 'Closed Now'}
        </Text>

        {isCustomPOI && endLocation?.data?.hours && (
          <>
            <Text>•</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.hoursText}>
              Hours: {endLocation.data.hours}
            </Text>
          </>
        )}
      </View>

      <Text style={styles.addressText}>{endLocation?.data?.address}</Text>

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
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: 4,
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
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameText: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
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
  hoursText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
  },
});
