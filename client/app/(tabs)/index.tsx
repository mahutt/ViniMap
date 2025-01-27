import { StyleSheet, Platform, SafeAreaView } from 'react-native';
import gareGeoJSON from '@/assets/geojson/gare.json';

import { ThemedView } from '@/components/ThemedView';

import React, { useCallback, useEffect, useState } from 'react';

import Mapbox from '@rnmapbox/maps';
import layers from '@/modules/map/style/DefaultLayers';
import { ExpressionSpecification, Level } from '@/modules/map/Types';
import { filterWithLevel } from '@/modules/map/Utils';
import { LocationSubscriber } from 'expo-location/build/LocationSubscribers';

// switch to .env file after
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoidmluaXNoYW1hbmVrIiwiYSI6ImNtNjZ4dWk1YzAydXEybG9qZnIxYWQ2b2UifQ.jEVYeMgWBj35nzZBJmsOvw';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// estimated campus coordinates (for toggle/buttons)
const CAMPUS_LOCATIONS = {
  SGW: {
    latitude: 45.4973,
    longitude: -73.5789,
  },
  LOYOLA: {
    latitude: 45.4582,
    longitude: -73.6403,
  },
};

const GARE_COORDINATES = {
  latitude: 48.876818,
  longitude: 2.358996,
};

interface Coordinate {
  latitude: number;
  longitude: number;
  name?: string;
}

// interface Place {
//   place_name: string;
//   center: [number, number];
// }

export default function HomeScreen() {
  console.log(layers[0].paint['fill-color']);
  console.log(layers.filter((layer) => layer.type === 'line').length);
  console.log(layers.filter((layer) => layer.type === 'line'));
  const mapRef = React.useRef<Mapbox.MapView | null>(null);
  const [startLocation, setStartLocation] = useState<Coordinate>(CAMPUS_LOCATIONS.SGW);
  const [level, setLevel] = useState<Level | null>(null);

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

  useEffect(() => {
    // setLevel(0);
    centerMap([GARE_COORDINATES.longitude, GARE_COORDINATES.latitude]);
  }, []);

  const cameraRef = React.useRef<Mapbox.Camera>(null);

  const centerMap = (coordinates: [number, number]) => {
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: 15,
        animationDuration: 2000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <Mapbox.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          onDidFinishLoadingMap={() => {
            centerMap([GARE_COORDINATES.longitude, GARE_COORDINATES.latitude]);
          }}>
          <Mapbox.Camera
            ref={cameraRef}
            zoomLevel={15}
            centerCoordinate={[startLocation.longitude, startLocation.latitude]}
            animationMode="flyTo"
            animationDuration={2000}
          />
          <Mapbox.UserLocation visible={true} />
          <Mapbox.ShapeSource id="indoor" shape={gareGeoJSON as GeoJSON.FeatureCollection}>
            {layers
              .filter((layer) => layer.type === 'fill')
              .map((layer) => {
                if (layer.id === 'indoor-rooms') {
                  console.log('hi');
                  console.log(JSON.stringify(filterFN(layer.filter)));
                }
                return (
                  <Mapbox.FillLayer
                    key={layer.id}
                    id={layer.id}
                    sourceID={layer.source ?? undefined}
                    style={{
                      fillColor: layer.paint['fill-color'] ?? undefined,
                      fillOutlineColor: layer.paint['fill-outline-color'] ?? undefined,
                      fillTranslateAnchor: layer.paint['fill-translate-anchor'] ?? undefined,
                    }}
                    filter={layer.filter ? filterFN(layer.filter) : undefined}
                  />
                );
              })}
          </Mapbox.ShapeSource>
        </Mapbox.MapView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  campusToggle: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: Platform.OS === 'ios' ? 0 : 30,
  },
  campusButton: {
    flex: 1,
    padding: 10,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  campusButtonActive: {
    backgroundColor: '#800020',
  },
  campusText: {
    color: '#000',
  },
  campusTextActive: {
    color: '#fff',
  },
  locationContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    zIndex: 1,
  },
  locationBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  currentLocationBtn: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  suggestionsBox: {
    maxHeight: 150,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  suggestion: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transportModes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  transportButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    width: 80,
  },
  transportButtonActive: {
    backgroundColor: '#e3f2fd',
  },
  transportText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  transportTextActive: {
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
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
  indoorMapButton: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  indoorMapButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
