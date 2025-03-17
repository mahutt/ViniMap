import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import React, { useCallback, useState, useEffect } from 'react';
import { MapState, useMap } from './MapContext';
import { Location, ExpressionSpecification } from '@/modules/map/Types';
import PointsOfInterestService from '@/services/PointsOfInterestService';
import { PointOfInterest } from './PointsOfInterestTypes';
import POIMarker from '@/components/POIMarker';
import layers from '@/modules/map/style/DefaultLayers';
import { filterWithLevel } from '@/modules/map/IndoorMapUtils';
import { images } from '@/assets';

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

  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>([]);
  const [showPOIs, setShowPOIs] = useState(false);

  useEffect(() => {
    const allPOIs = PointsOfInterestService.getAllPOIs();
    setPointsOfInterest(allPOIs);

    setShowPOIs(PointsOfInterestService.shouldShowPOIs(zoomLevel));
  }, [zoomLevel]);

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
      {showPOIs &&
        pointsOfInterest.map((poi) => (
          <Mapbox.MarkerView
            key={poi.id}
            id={`poi-${poi.id}`}
            coordinate={poi.coordinates}
            anchor={{ x: 0.5, y: 0.5 }}>
            <TouchableOpacity
              onPress={() => {
                onMapPress({ geometry: { coordinates: poi.coordinates } });
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <POIMarker type={poi.type} />
            </TouchableOpacity>
          </Mapbox.MarkerView>
        ))}

      {endLocation && !equalLocations(endLocation, userLocation) && (
        <Mapbox.MarkerView id="end" coordinate={endLocation.coordinates}>
          <View style={[styles.marker, styles.endMarker]} />
        </Mapbox.MarkerView>
      )}

      {userLocation?.coordinates && (
        <Mapbox.PointAnnotation
          key="user-location"
          id="user-location"
          coordinate={userLocation.coordinates}>
          <View style={[styles.marker, styles.userLocationMarker]} />
          <Mapbox.Callout title="Current Location" />
        </Mapbox.PointAnnotation>
      )}

      {state === MapState.RoutePlanning && startLocation !== null && endLocation !== null && (
        <>
          {!equalLocations(startLocation, userLocation) && (
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
                  // level: segment.level,
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
                // filter={[
                //   'any',
                //   ['!', ['has', 'level']],
                //   [
                //     'all',
                //     ['has', 'level'],
                //     ['any', ['==', ['get', 'level'], (level ?? -100).toString()]],
                //   ],
                // ]}
              />
            </Mapbox.ShapeSource>
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
});
