import { StyleSheet } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import React from 'react';
import { MapState, useMap } from './MapContext';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);


export default function MapView() {
  const { state, setState ,setLongitude, setLatitude, mapRef, cameraRef, centerCoordinate, zoomLevel } = useMap();

 function onMapClick(event: any) {
    const { geometry } = event;
    if (geometry && geometry.coordinates) {
      const [longitude, latitude] = geometry.coordinates;
      console.log(`Coordinates: Latitude: ${latitude}, Longitude: ${longitude}`);
   
      console.log("Setting State to Information...");
      setLongitude(longitude);
      setLatitude(latitude);
      setState(MapState.Information);
    }
  } 
  return (
    <Mapbox.MapView ref={mapRef} style={styles.map} styleURL={Mapbox.StyleURL.Street} onPress={onMapClick}>
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
