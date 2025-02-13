import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import React from 'react';
import { MapState, useMap } from './MapContext';
import { fetchLocationData } from './MapService';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);

export default function MapView() {
  const {
    state,
    setState,
    startLocation,
    endLocation,
    setStartLocation,
    setEndLocation,
    mapRef,
    cameraRef,
    centerCoordinate,
    zoomLevel,
    pitchLevel,
    routeCoordinates,
  } = useMap();

  function onMapClick(event: any) {
    const { geometry } = event;

    if (!geometry?.coordinates) {
      console.warn('No coordinates found in the event.');
      return;
    }

    const coordinates = geometry.coordinates;

    if (state === MapState.SelectingStartLocation) {
      setStartLocation({ name: null, coordinates: coordinates });
      fetchLocationData(coordinates)
        .then((data) => {
          if (data) {
            setStartLocation({ name: data.name, coordinates: coordinates, data });
            setState(MapState.RoutePlanning);
          }
        })
        .catch((error) => {
          console.warn('Error fetching location data:', error);
        });
    } else {
      setEndLocation({ name: null, coordinates: coordinates });
      fetchLocationData(coordinates)
        .then((data) => {
          if (data) {
            setEndLocation({ name: data.name, coordinates: coordinates, data });
            setState(MapState.Information);
            if (cameraRef.current) {
              cameraRef.current.flyTo(coordinates, 1000);
            }
          }
          if (cameraRef.current) {
            cameraRef.current.flyTo(coordinates, 1000);
          }
          setState(MapState.Information);
        })
        .catch((error) => {
          console.warn('Error fetching location data:', error);

          if (cameraRef.current) {
            cameraRef.current.flyTo(coordinates, 1000);
          }
          setState(MapState.Information);
        });
    }
  }
  return (
    <Mapbox.MapView
      ref={mapRef}
      style={styles.map}
      styleURL="mapbox://styles/ambrose821/cm6g7anat00kv01qmbxkze6i8"
      onPress={onMapClick}>
      <Mapbox.Camera
        ref={cameraRef}
        zoomLevel={zoomLevel}
        centerCoordinate={centerCoordinate}
        animationMode="flyTo"
        animationDuration={2000}
        pitch={pitchLevel}
      />

      {endLocation?.coordinates && (
        <Mapbox.PointAnnotation
          key="selected-location"
          id="selected-location"
          coordinate={[endLocation?.coordinates[0], endLocation?.coordinates[1]]}>
          <View style={[styles.marker, styles.endMarker]} />
          <Mapbox.Callout title="Selected Location" />
        </Mapbox.PointAnnotation>
      )}

      {state === MapState.RoutePlanning && startLocation !== null && endLocation !== null && (
        <>
          <Mapbox.MarkerView id="start" coordinate={startLocation.coordinates}>
            <View style={[styles.marker, styles.startMarker]} />
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
    width: 25,
    height: 25,
    borderRadius: 15,
    borderColor: 'white',
    borderWidth: 2,
  },
  startMarker: {
    backgroundColor: '#852C3A',
  },
  endMarker: {
    backgroundColor: '#852C3A',
  },
});
