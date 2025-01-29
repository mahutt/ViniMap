import { StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import React from 'react';
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);

// downtown concordia campus (sgw)
const DEFAULT_COORDINATES = {
  longitude: -73.5789,
  latitude: 45.4973,
};

export default function Map() {
  const mapRef = React.useRef<Mapbox.MapView | null>(null);
  const cameraRef = React.useRef<Mapbox.Camera | null>(null);
  return (
    <Mapbox.MapView ref={mapRef} style={styles.map} styleURL={Mapbox.StyleURL.Street}>
      <Mapbox.Camera
        ref={cameraRef}
        zoomLevel={15}
        centerCoordinate={[DEFAULT_COORDINATES.longitude, DEFAULT_COORDINATES.latitude]}
        animationMode="flyTo"
        animationDuration={2000}
      />
    </Mapbox.MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
