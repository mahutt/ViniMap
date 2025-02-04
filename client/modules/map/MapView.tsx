import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import React, { useState } from 'react';
import { MapState, useMap } from './MapContext';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);

export default function MapView() {
  const { setState, setLongitude, setLatitude, mapRef, cameraRef, centerCoordinate, zoomLevel } =
    useMap();

  const [selectedLocation, setSelectedLocation] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);

  function onMapClick(event: any) {
    const { geometry } = event;

    if (geometry && geometry.coordinates) {
      const [longitude, latitude] = geometry.coordinates;
      console.log(`Captured Coordinates -> Latitude: ${latitude}, Longitude: ${longitude}`);

      setLongitude(longitude);
      setLatitude(latitude);
      setState(MapState.Information);

      setSelectedLocation({ longitude, latitude });

      // Center the map on the clicked location
      if (cameraRef.current) {
        cameraRef.current.flyTo([longitude, latitude], 1000);
      }
    } else {
      console.warn('No coordinates found in the event.');
    }
  }

  return (
    <Mapbox.MapView
      ref={mapRef}
      style={styles.map}
      styleURL={Mapbox.StyleURL.Street}
      onPress={onMapClick}>
      <Mapbox.Camera
        ref={cameraRef}
        zoomLevel={14}
        centerCoordinate={centerCoordinate}
        animationMode="flyTo"
        animationDuration={2000}
      />

      {selectedLocation && (
        <Mapbox.PointAnnotation
          key="selected-location"
          id="selected-location"
          coordinate={[selectedLocation.longitude, selectedLocation.latitude]}>
          <View style={styles.marker} />
          <Mapbox.Callout title="Selected Location" />
        </Mapbox.PointAnnotation>
      )}
    </Mapbox.MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  marker: {
    width: 25,
    height: 25,
    backgroundColor: '#852C3A',
    borderRadius: 15,
    borderColor: 'white',
    borderWidth: 2,
  },
});
