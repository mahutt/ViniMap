import { StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import React from 'react';
import { useMap } from './MapContext';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);

export default function MapView() {
  const { mapRef, cameraRef, centerCoordinate, zoomLevel, pitchLevel } = useMap();
  return (
    <Mapbox.MapView ref={mapRef} style={styles.map} styleURL='mapbox://styles/ambrose821/cm6g7anat00kv01qmbxkze6i8'>
      <Mapbox.Camera
        ref={cameraRef}
        zoomLevel={zoomLevel}
        centerCoordinate={centerCoordinate}
        animationMode="flyTo"
        animationDuration={2000}
        pitch={pitchLevel}
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
