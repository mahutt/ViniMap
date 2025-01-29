import { StyleSheet, View } from 'react-native';
import React from 'react';
import Mapbox from '@rnmapbox/maps';
import { SearchBar } from '@/components/SearchBar';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);

// downtown concordia campus (sgw)
const DEFAULT_COORDINATES = {
  longitude: -73.5789,
  latitude: 45.4973,
};

export default function HomeScreen() {
  const mapRef = React.useRef<Mapbox.MapView | null>(null);
  const cameraRef = React.useRef<Mapbox.Camera | null>(null);

  return (
    <View style={styles.container}>
      <Mapbox.MapView ref={mapRef} style={styles.map} styleURL={Mapbox.StyleURL.Street}>
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={15}
          centerCoordinate={[DEFAULT_COORDINATES.longitude, DEFAULT_COORDINATES.latitude]}
          animationMode="flyTo"
          animationDuration={2000}
        />
      </Mapbox.MapView>
      <View style={styles.searchContainer}>
        <SearchBar onSearch={(query) => console.log(query)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
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
