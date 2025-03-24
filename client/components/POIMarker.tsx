import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { POIType } from '../modules/map/PointsOfInterestTypes';

interface POIMarkerProps {
  type: POIType;
  size?: number;
}

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

const colorMap: Record<POIType, string> = {
  bixi: '#5cb85c',
  metro: '#0d6efd',
  bus_station: '#6f42c1',
  restaurant: '#fd7e14',
  park: '#20c997',
  library: '#6c757d',
  shopping: '#dc3545',
  other: '#adb5bd',
};

const POIMarker: React.FC<POIMarkerProps> = ({ type, size = 24 }) => {
  // Get the icon name, defaulting to 'location-outline'
  const iconName = iconMap[type] || 'location-outline';

  return (
    <View style={[styles.container, { backgroundColor: colorMap[type] || colorMap.other }]}>
      <Ionicons name={iconName} size={size} color="white" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default POIMarker;
