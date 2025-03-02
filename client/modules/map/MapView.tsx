import { StyleSheet, View, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { MapState, useMap } from './MapContext';
import { fetchLocationData, getPOIsNearby } from './MapService';
import { useEffect, useState } from 'react';
import { Location } from './MapContext';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string);

const poiIconStyles = {
  restaurant: { backgroundColor: '#E63946' },
  cafe: { backgroundColor: '#F4A261' },
  park: { backgroundColor: '#2A9D8F' },
  shop: { backgroundColor: '#457B9D' },
  default: { backgroundColor: '#6D597A' },
};

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
    route,
  } = useMap();

  const [pointsOfInterest, setPointsOfInterest] = useState<Location[]>([]);
  const [showPOIs, setShowPOIs] = useState(false);

  useEffect(() => {
    if (showPOIs) {
      loadPointsOfInterest();
    }
  }, [centerCoordinate, showPOIs]);

  const loadPointsOfInterest = async () => {
    try {
      const pois = await getPOIsNearby(centerCoordinate);
      setPointsOfInterest(pois);
    } catch (error) {
      console.error('Error loading POIs:', error);
    }
  };

  const togglePOIs = () => {
    setShowPOIs((prev) => !prev);
  };

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

  const getPOIStyle = (poi: Location) => {
    const category = poi.data?.type?.toLowerCase() || 'default';
    if (category.includes('restaurant') || category.includes('food')) {
      return poiIconStyles.restaurant;
    } else if (category.includes('cafe') || category.includes('coffee')) {
      return poiIconStyles.cafe;
    } else if (category.includes('park') || category.includes('garden')) {
      return poiIconStyles.park;
    } else if (category.includes('shop') || category.includes('store')) {
      return poiIconStyles.shop;
    }
    return poiIconStyles.default;
  };

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
        pointsOfInterest.map((poi, index) => (
          <Mapbox.MarkerView key={`poi-${index}`} id={`poi-${index}`} coordinate={poi.coordinates}>
            <View style={[styles.poiMarker, getPOIStyle(poi)]}>
              <Text style={styles.poiIcon}>•</Text>
            </View>
            <Mapbox.Callout title={poi.name || 'Point of Interest'} />
          </Mapbox.MarkerView>
        ))}

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
});
