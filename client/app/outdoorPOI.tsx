import React, { useEffect } from 'react';
import MapView from '@/modules/map/MapView';
import OutdoorPointsOfInterest from '@/modules/map/OutdoorPointsOfInterest';
import { MapProvider, useMap } from '@/modules/map/MapContext';
import { StyleSheet, View, Text as RNText } from 'react-native';

function MapViewContainer() {
  const { flyTo } = useMap();

  useEffect(() => {
    flyTo([-73.57791396549962, 45.495102086770814], 15);
  }, [flyTo]);

  return (
    <>
      <MapView />
      <OutdoorPointsOfInterest radius={2000} />
      <OutdoorMapHint />
    </>
  );
}

export default function OutdoorPOIScreen() {
  return (
    <View style={styles.container}>
      <MapProvider>
        <MapViewContainer />
      </MapProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const OutdoorMapHint = () => {
  return (
    <View style={hintStyles.hintContainer}>
      <RNText style={hintStyles.hintText}>
        Outdoor points of interest are automatically displayed on the map
      </RNText>
    </View>
  );
};

const hintStyles = StyleSheet.create({
  hintContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
  },
  hintText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
