import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { Location, MapState, useMap } from './MapContext';
import { fetchLocationData } from './MapService';
import PointsOfInterestService from '@/services/PointsOfInterestService';
import { useState, useEffect } from 'react';
import { PointOfInterest } from './PointsOfInterestTypes';
import POIMarker from '@/components/POIMarker';

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
    setState,
    startLocation,
    endLocation,
    userLocation,
    setStartLocation,
    setEndLocation,
    mapRef,
    cameraRef,
    centerCoordinate,
    zoomLevel,
    pitchLevel,
    route,
  } = useMap();

  const [pointsOfInterest, setPointsOfInterest] = useState<PointOfInterest[]>([]);
  const [showPOIs, setShowPOIs] = useState(false);

  useEffect(() => {
    const allPOIs = PointsOfInterestService.getAllPOIs();
    setPointsOfInterest(allPOIs);

    setShowPOIs(PointsOfInterestService.shouldShowPOIs(zoomLevel));
  }, [zoomLevel]);

  function onMapClick(event: any) {
    const { geometry } = event;

    if (!geometry?.coordinates) {
      return;
    }

    const coordinates = geometry.coordinates;
    const clickedPOI = PointsOfInterestService.findClosestPOI(coordinates);

    if (clickedPOI) {
      const poiLocation: Location = {
        name: clickedPOI.name,
        coordinates: clickedPOI.coordinates,
        data: {
          address: clickedPOI.address,
          isOpen: clickedPOI.openingHours.isOpen,
          hours: clickedPOI.openingHours.hours,
          description: clickedPOI.description || '',
        },
      };

      setEndLocation(poiLocation);
      setState(MapState.Information);

      if (cameraRef.current) {
        cameraRef.current.flyTo(clickedPOI.coordinates, 17);
      }
    } else {
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

      {showPOIs &&
        pointsOfInterest.map((poi) => (
          <Mapbox.MarkerView
            key={poi.id}
            id={`poi-${poi.id}`}
            coordinate={poi.coordinates}
            anchor={{ x: 0.5, y: 0.5 }}>
            <TouchableOpacity
              onPress={() => {
                const poiLocation: Location = {
                  name: poi.name,
                  coordinates: poi.coordinates,
                  data: {
                    address: poi.address,
                    isOpen: poi.openingHours.isOpen,
                    hours: poi.openingHours.hours,
                    description: poi.description || '',
                  },
                };

                setEndLocation(poiLocation);
                setState(MapState.Information);

                if (cameraRef.current) {
                  cameraRef.current.flyTo(poi.coordinates, 17);
                }
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <POIMarker type={poi.type} />
            </TouchableOpacity>
          </Mapbox.MarkerView>
        ))}

      {endLocation && !equalLocations(endLocation, userLocation) && (
        <Mapbox.PointAnnotation
          key="selected-location"
          id="selected-location"
          coordinate={endLocation.coordinates}>
          <View style={[styles.marker, styles.endMarker]} />
          <Mapbox.Callout title="Selected Location" />
        </Mapbox.PointAnnotation>
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
                properties: {},
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
              />
            </Mapbox.ShapeSource>
          ))}
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
  userLocationMarker: {
    backgroundColor: '#007AFF',
  },
});
