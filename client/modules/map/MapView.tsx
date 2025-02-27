import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
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
    isDotted,
    isShuttle,
    firstWalkCoordinates,
    shuttleCoordimates,
    secondWalkCoordimates,
  } = useMap();

  function onMapClick(event: any) {
    const { geometry } = event;

    if (!geometry?.coordinates) {
      return;
    }

    const coordinates = geometry.coordinates;

    fetchLocationData(coordinates)
      .then((data) => {
        switch (state) {
          case MapState.SelectingStartLocation:
            setStartLocation({
              name: data?.name || null,
              coordinates: coordinates,
              data: data || undefined,
            });
            if (endLocation) {
              setState(MapState.RoutePlanning);
            }
            break;

          case MapState.SelectingEndLocation:
            setEndLocation({
              name: data?.name || 'Selected Location',
              coordinates: coordinates,
              data: data || { address: 'Location', isOpen: false },
            });
            setState(MapState.RoutePlanning);
            break;

          default:
            setEndLocation({
              name: data?.name || 'Selected Location',
              coordinates: coordinates,
              data: data || { address: 'Location', isOpen: false },
            });
            setState(MapState.Information);
            break;
        }
      })
      .catch((error) => {
        console.warn('Error fetching location data:', error);

        switch (state) {
          case MapState.SelectingStartLocation:
            setStartLocation({
              name: null,
              coordinates: coordinates,
            });
            break;

          case MapState.SelectingEndLocation:
          default:
            setEndLocation({
              name: 'Selected Location',
              coordinates: coordinates,
              data: { address: 'Location', isOpen: false },
            });
            setState(MapState.Information);
            break;
        }
      });

    if (cameraRef.current) {
      cameraRef.current.flyTo(coordinates, 17);
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

          {!isShuttle && routeCoordinates.length > 0 && (
            <Mapbox.ShapeSource
              key={isDotted ? 'dotted' : 'solid'}
              id="normalRoute"
              shape={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates,
                },
              }}>
              <Mapbox.LineLayer
                id="normalRouteLine"
                style={{
                  lineColor: '#007AFF',
                  lineWidth: 4,
                  lineCap: 'round',
                  lineJoin: 'round',
                  lineDasharray: isDotted ? [3, 3] : undefined,
                }}
              />
            </Mapbox.ShapeSource>
          )}

          {isShuttle && (
            <>
              {/* First Walk */}
              {firstWalkCoordinates.length > 0 && (
                <Mapbox.ShapeSource
                  key="firstWalk"
                  id="firstWalkRoute"
                  shape={{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      coordinates: firstWalkCoordinates,
                    },
                  }}>
                  <Mapbox.LineLayer
                    id="firstWalkLine"
                    style={{
                      lineColor: '#007AFF',
                      lineWidth: 4,
                      lineCap: 'round',
                      lineJoin: 'round',
                      lineDasharray: [3, 3],
                    }}
                  />
                </Mapbox.ShapeSource>
              )}

              {/* Shuttle Route */}
              {shuttleCoordimates.length > 0 && (
                <Mapbox.ShapeSource
                  key="shuttle"
                  id="shuttleRoute"
                  shape={{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      coordinates: shuttleCoordimates,
                    },
                  }}>
                  <Mapbox.LineLayer
                    id="shuttleLine"
                    style={{
                      lineColor: '#007AFF',
                      lineWidth: 4,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }}
                  />
                </Mapbox.ShapeSource>
              )}

              {/* Second Walk*/}
              {secondWalkCoordimates.length > 0 && (
                <Mapbox.ShapeSource
                  key="secondWalk"
                  id="secondWalkRoute"
                  shape={{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      coordinates: secondWalkCoordimates,
                    },
                  }}>
                  <Mapbox.LineLayer
                    id="secondWalkLine"
                    style={{
                      lineColor: '#007AFF',
                      lineWidth: 4,
                      lineCap: 'round',
                      lineJoin: 'round',
                      lineDasharray: [1, 2],
                    }}
                  />
                </Mapbox.ShapeSource>
              )}
            </>
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
