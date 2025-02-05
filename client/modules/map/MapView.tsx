import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import React from 'react';
import { useMap, MapState } from './MapContext';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);

export default function MapView() {

  const {
    mapRef,
    cameraRef,
    centerCoordinate,
    zoomLevel,
    pitchLevel,
    state,
    startLocation,
    endLocation,
    routeCoordinates,
  } = useMap();

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

      {state === MapState.RoutePlanning && startLocation !== null && endLocation !== null && (
        <>
          <Mapbox.MarkerView id="start" coordinate={startLocation.coordinates}>
            <View style={[styles.marker, styles.startMarker]} />
          </Mapbox.MarkerView>
          <Mapbox.MarkerView id="end" coordinate={endLocation.coordinates}>
            <View style={[styles.marker, styles.endMarker]} />
          </Mapbox.MarkerView>
          {routeCoordinates.length > 0 && (
            <Mapbox.ShapeSource
              id="routeSource"
              shape={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates,
                },
              }}>
              <Mapbox.LineLayer
                id="routeFill"
                style={{
                  lineColor: '#007AFF',
                  lineWidth: 4,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </Mapbox.ShapeSource>
          )}
        </>
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
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  startMarker: {
    backgroundColor: '#00B800',
  },
  endMarker: {
    backgroundColor: '#FF0000',
  },
});
