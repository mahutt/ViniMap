import { StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import React from 'react';
import { useMap } from './MapContext';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);

export default function Map() {
  const { mapRef, cameraRef, centerCoordinate, zoomLevel } = useMap();
  return (
    <Mapbox.MapView ref={mapRef} style={styles.map} styleURL={Mapbox.StyleURL.Street}>
      <Mapbox.Camera
        ref={cameraRef}
        zoomLevel={zoomLevel}
        centerCoordinate={centerCoordinate}
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
