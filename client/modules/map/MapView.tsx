import { StyleSheet, View, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import React, { useCallback } from 'react';
import { MapState, useMap } from './MapContext';
import { Location, ExpressionSpecification } from '@/modules/map/Types';
import layers from '@/modules/map/style/DefaultLayers';
import { filterWithLevel } from '@/modules/map/IndoorMapUtils';
import { images } from '@/assets';
import { useTask } from '@/providers/TaskContext';
import PointsOfInterestService from '@/services/PointsOfInterestService';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);

const equalLocations = (a: Location | null, b: Location | null): boolean => {
  if (!a || !b) {
    return false;
  }
  return a.coordinates[0] === b.coordinates[0] && a.coordinates[1] === b.coordinates[1];
};

export default function MapView() {
  const {
    state,
    startLocation,
    endLocation,
    userLocation,
    mapRef,
    cameraRef,
    centerCoordinate,
    zoomLevel,
    pitchLevel,
    route,
    level,
    indoorMap,
    updateSelectedMapIfNeeded,
    onMapPress,
  } = useMap();

  const { selectedTasks } = useTask();

  const filterFN = useCallback(
    (filter: ExpressionSpecification) => {
      let filterFn: (filter: ExpressionSpecification) => ExpressionSpecification;
      if (level !== null) {
        filterFn = (filter: ExpressionSpecification) => filterWithLevel(filter, level, false);
      } else {
        filterFn = (filter: ExpressionSpecification): ExpressionSpecification => filter;
      }
      return filterFn(filter);
    },
    [level]
  );

  return (
    <Mapbox.MapView
      ref={mapRef}
      style={styles.map}
      styleURL="mapbox://styles/ambrose821/cm6g7anat00kv01qmbxkze6i8"
      onPress={onMapPress}
      onCameraChanged={() => updateSelectedMapIfNeeded()}>
      <Mapbox.Camera
        ref={cameraRef}
        zoomLevel={zoomLevel}
        centerCoordinate={centerCoordinate}
        animationMode="flyTo"
        animationDuration={2000}
        pitch={pitchLevel}
      />
      <Mapbox.Images images={images} />
      <Mapbox.ShapeSource id="outdoor-pois" shape={PointsOfInterestService.getFeatureCollection()}>
        <Mapbox.SymbolLayer
          id="outdoor-poi-icons"
          sourceID="outdoor-pois"
          style={{
            iconSize: 1,
            iconImage: '{amenity}',
            iconAnchor: 'center',
            symbolSpacing: 250,
            symbolPlacement: 'point',
            visibility: 'visible',
            iconOptional: false,
            iconAllowOverlap: false,
            iconOpacity: ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 1],
          }}
        />
      </Mapbox.ShapeSource>

      {endLocation && !equalLocations(endLocation, userLocation) && (
        <Mapbox.MarkerView id="end" coordinate={endLocation.coordinates}>
          <View style={[styles.marker, styles.endMarker]} />
        </Mapbox.MarkerView>
      )}

      {userLocation?.coordinates && (
        <Mapbox.MarkerView id="user-location" coordinate={userLocation.coordinates}>
          <View style={[styles.marker, styles.userLocationMarker]} />
        </Mapbox.MarkerView>
      )}

      {state === MapState.RoutePlanning && (
        <>
          {startLocation && !equalLocations(startLocation, userLocation) && (
            <Mapbox.MarkerView id="start" coordinate={startLocation.coordinates}>
              <View style={[styles.marker, styles.startMarker]} />
            </Mapbox.MarkerView>
          )}

          {route?.segments.map((segment) => (
            <Mapbox.ShapeSource
              key={segment.id}
              id={segment.id}
              shape={{
                type: 'Feature',
                properties: {
                  level: segment.level,
                },
                geometry: {
                  type: 'LineString',
                  coordinates: segment.steps,
                },
              }}>
              <Mapbox.LineLayer
                id={`${segment.id}-line`}
                style={{
                  lineColor: '#007AFF',
                  lineWidth: 4,
                  lineCap: 'round',
                  lineJoin: 'round',
                  lineDasharray: segment.type === 'dashed' ? [3, 3] : undefined,
                }}
                filter={[
                  'any',
                  ['!', ['has', 'level']],
                  level
                    ? ['all', ['has', 'level'], ['any', ['==', ['get', 'level'], level]]]
                    : false,
                ]}
              />
            </Mapbox.ShapeSource>
          ))}

          {selectedTasks.map((task, index) => (
            <Mapbox.MarkerView
              key={`task-marker-${task.id}`}
              id={`task-${task.id}`}
              coordinate={task.location.coordinates}>
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>
                  {selectedTasks.findIndex((t) => t.id === task.id) + 1}
                </Text>
              </View>
            </Mapbox.MarkerView>
          ))}
        </>
      )}
      {indoorMap !== null && (
        <Mapbox.ShapeSource id="indoor" shape={indoorMap.geojson}>
          <>
            {layers
              .filter((layer) => layer.type === 'fill')
              .map((layer) => {
                return (
                  <Mapbox.FillLayer
                    key={layer.id}
                    id={layer.id}
                    sourceID={layer.source ?? undefined}
                    style={layer.style}
                    filter={layer.filter ? filterFN(layer.filter) : undefined}
                  />
                );
              })}
            {layers
              .filter((layer) => layer.type === 'line')
              .map((layer) => {
                return (
                  <Mapbox.LineLayer
                    key={layer.id}
                    id={layer.id}
                    sourceID={layer.source ?? undefined}
                    style={layer.style}
                    filter={layer.filter ? filterFN(layer.filter) : undefined}
                  />
                );
              })}
            {layers
              .filter((layer) => layer.type === 'symbol')
              .map((layer) => {
                return (
                  <Mapbox.SymbolLayer
                    key={layer.id}
                    id={layer.id}
                    sourceID={layer.source ?? undefined}
                    style={layer.style}
                    filter={layer.filter ? filterFN(layer.filter) : undefined}
                  />
                );
              })}
          </>
        </Mapbox.ShapeSource>
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
  userLocationMarker: {
    backgroundColor: '#007AFF',
  },
  numberedMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#852C3A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#852C3A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
