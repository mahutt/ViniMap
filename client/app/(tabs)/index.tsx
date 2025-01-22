import {
  Image,
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React, { useEffect, useState } from 'react';

import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// switch to .env file after
const MAPBOX_ACCESS_TOKEN =
  'pk.eyJ1IjoidmluaXNoYW1hbmVrIiwiYSI6ImNtNjZ4dWk1YzAydXEybG9qZnIxYWQ2b2UifQ.jEVYeMgWBj35nzZBJmsOvw';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// three transport modes
type TransportMode = 'driving' | 'walking' | 'cycling';

const TRANSPORT_MODES = [
  { id: 'driving', icon: 'car', label: 'Drive' },
  { id: 'walking', icon: 'walk', label: 'Walk' },
  { id: 'cycling', icon: 'bicycle', label: 'Bike' },
] as const;

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

// building coordinates (both campuses) for overlay testing
const CAMPUS_BUILDINGS = {
  SGW: [
    {
      name: 'Hall Building',
      coordinates: [
        [-73.5789, 45.4973],
        [-73.5789, 45.4967],
        [-73.5782, 45.4967],
        [-73.5782, 45.4973],
        [-73.5789, 45.4973],
      ],
    },
    {
      name: 'Library Building',
      coordinates: [
        [-73.5782, 45.4971],
        [-73.5782, 45.4965],
        [-73.5775, 45.4965],
        [-73.5775, 45.4971],
        [-73.5782, 45.4971],
      ],
    },
    {
      name: 'EV Building',
      coordinates: [
        [-73.5785, 45.4957],
        [-73.5785, 45.4951],
        [-73.5776, 45.4951],
        [-73.5776, 45.4957],
        [-73.5785, 45.4957],
      ],
    },
  ],
  LOYOLA: [
    {
      name: 'Communication Studies and Journalism Building',
      coordinates: [
        [-73.6401, 45.4579],
        [-73.6401, 45.4575],
        [-73.6393, 45.4575],
        [-73.6393, 45.4579],
        [-73.6401, 45.4579],
      ],
    },
    {
      name: 'Vanier Library',
      coordinates: [
        [-73.6384, 45.459],
        [-73.6384, 45.4585],
        [-73.6375, 45.4585],
        [-73.6375, 45.459],
        [-73.6384, 45.459],
      ],
    },
  ],
};

interface Coordinate {
  latitude: number;
  longitude: number;
  name?: string;
}

interface Place {
  place_name: string;
  center: [number, number];
}

export default function HomeScreen() {
  const mapRef = React.useRef<Mapbox.MapView | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<'SGW' | 'LOYOLA'>('SGW');
  const [transportMode, setTransportMode] = useState<TransportMode>('driving');
  const [currentLocation, setCurrentLocation] = useState<Coordinate>(CAMPUS_LOCATIONS.SGW);
  const [startLocation, setStartLocation] = useState<Coordinate>(CAMPUS_LOCATIONS.SGW);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<Place[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<Place[]>([]);
  const [destinationLocation, setDestinationLocation] = useState<Coordinate | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        alert('Location services are disabled. Please enable them in your device settings.');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied. Please enable it in your settings.');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
      });

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        name: 'Current Location',
      };

      setCurrentLocation(newLocation);
      setStartLocation(newLocation);
      setStartAddress('Current Location');

      if (position.coords.latitude && position.coords.longitude) {
        centerMap([position.coords.longitude, position.coords.latitude]);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get current location. Please check your device settings.');
    }
  };

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

  const getSuggestions = async (text: string, isStart: boolean) => {
    try {
      if (text.length < 2) {
        isStart ? setStartSuggestions([]) : setEndSuggestions([]);
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          text
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&proximity=-73.5789,45.4973&types=place,address,poi&language=en`
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const suggestions = data.features.map((feature: any) => ({
          place_name: feature.place_name,
          center: feature.center,
        }));

        if (isStart) {
          setStartSuggestions(suggestions);
          setShowStartSuggestions(true);
        } else {
          setEndSuggestions(suggestions);
          setShowEndSuggestions(true);
        }
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      alert('Error getting location suggestions. Please try again.');
    }
  };

  const selectSuggestion = (place: Place, isStart: boolean) => {
    const [longitude, latitude] = place.center;
    if (isStart) {
      setStartLocation({ latitude, longitude, name: place.place_name });
      setStartAddress(place.place_name);
      setShowStartSuggestions(false);
      centerMap([longitude, latitude]);
    } else {
      setDestinationLocation({ latitude, longitude, name: place.place_name });
      setEndAddress(place.place_name);
      setShowEndSuggestions(false);
      if (startLocation) {
        getRoute();
      }
    }
  };

  const useCurrentLocation = () => {
    setStartAddress('Current Location');
    setStartLocation(currentLocation);
    setShowStartSuggestions(false);
    centerMap([currentLocation.longitude, currentLocation.latitude]);
  };

  const getRoute = async () => {
    try {
      if (!startLocation || !destinationLocation) return;

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${startLocation.longitude},${startLocation.latitude};${destinationLocation.longitude},${destinationLocation.latitude}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
      );

      const data = await response.json();
      if (data.routes && data.routes[0]) {
        setRouteCoordinates(data.routes[0].geometry.coordinates);

        // Adjust map to show the entire route
        const coordinates = data.routes[0].geometry.coordinates;
        if (coordinates.length > 0) {
          const bounds = coordinates.reduce(
            (bounds: any, coord: [number, number]) => {
              return {
                ne: {
                  latitude: Math.max(bounds.ne.latitude, coord[1]),
                  longitude: Math.max(bounds.ne.longitude, coord[0]),
                },
                sw: {
                  latitude: Math.min(bounds.sw.latitude, coord[1]),
                  longitude: Math.min(bounds.sw.longitude, coord[0]),
                },
              };
            },
            {
              ne: { latitude: -90, longitude: -180 },
              sw: { latitude: 90, longitude: 180 },
            }
          );

          // Fit the map to the bounds of the route
          if (cameraRef.current) {
            cameraRef.current.fitBounds(
              [bounds.sw.longitude, bounds.sw.latitude],
              [bounds.ne.longitude, bounds.ne.latitude],
              50, // padding
              2000 // animation duration
            );
          }
        }
      }
    } catch (error) {
      console.error('Error getting route:', error);
    }
  };

  const switchCampus = (campus: 'SGW' | 'LOYOLA') => {
    setSelectedCampus(campus);
    const campusLocation = CAMPUS_LOCATIONS[campus];
    setStartLocation(campusLocation);
    setStartAddress(`${campus} Campus`);
    centerMap([campusLocation.longitude, campusLocation.latitude]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Campus Toggle */}
        <View style={styles.campusToggle}>
          <TouchableOpacity
            style={[styles.campusButton, selectedCampus === 'SGW' && styles.campusButtonActive]}
            onPress={() => switchCampus('SGW')}>
            <Text style={selectedCampus === 'SGW' ? styles.campusTextActive : styles.campusText}>
              SGW Campus
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.campusButton, selectedCampus === 'LOYOLA' && styles.campusButtonActive]}
            onPress={() => switchCampus('LOYOLA')}>
            <Text style={selectedCampus === 'LOYOLA' ? styles.campusTextActive : styles.campusText}>
              Loyola Campus
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Search Container */}
        <View style={styles.locationContainer}>
          {/* Start Location Box */}
          <View style={styles.locationBox}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={20} color="#007AFF" />
              <Text style={styles.locationLabel}>Start</Text>
            </View>
            <View style={styles.locationInputWrapper}>
              <TextInput
                style={styles.locationInput}
                placeholder="Choose starting point"
                value={startAddress}
                onChangeText={(text) => {
                  setStartAddress(text);
                  getSuggestions(text, true);
                }}
                onFocus={() => setShowStartSuggestions(true)}
              />
              <TouchableOpacity style={styles.currentLocationBtn} onPress={useCurrentLocation}>
                <Ionicons name="locate" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            {showStartSuggestions && startSuggestions.length > 0 && (
              <ScrollView style={styles.suggestionsBox}>
                {startSuggestions.map((place, index) => (
                  <TouchableOpacity
                    key={index.toString()}
                    style={styles.suggestion}
                    onPress={() => selectSuggestion(place, true)}>
                    <Text numberOfLines={1}>{place.place_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* End Location Box */}
          <View style={styles.locationBox}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={20} color="#FF3B30" />
              <Text style={styles.locationLabel}>Destination</Text>
            </View>
            <View style={styles.locationInputWrapper}>
              <TextInput
                style={styles.locationInput}
                placeholder="Choose destination"
                value={endAddress}
                onChangeText={(text) => {
                  setEndAddress(text);
                  getSuggestions(text, false);
                }}
                onFocus={() => setShowEndSuggestions(true)}
              />
            </View>
            {showEndSuggestions && endSuggestions.length > 0 && (
              <ScrollView style={styles.suggestionsBox}>
                {endSuggestions.map((place, index) => (
                  <TouchableOpacity
                    key={index.toString()}
                    style={styles.suggestion}
                    onPress={() => selectSuggestion(place, false)}>
                    <Text numberOfLines={1}>{place.place_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Transport Mode Selection */}
          <View style={styles.transportModes}>
            {TRANSPORT_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.transportButton,
                  transportMode === mode.id && styles.transportButtonActive,
                ]}
                onPress={() => {
                  setTransportMode(mode.id);
                  if (startLocation && destinationLocation) {
                    getRoute();
                  }
                }}>
                <Ionicons
                  name={mode.icon as any}
                  size={24}
                  color={transportMode === mode.id ? '#007AFF' : '#666'}
                />
                <Text
                  style={[
                    styles.transportText,
                    transportMode === mode.id && styles.transportTextActive,
                  ]}>
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!startLocation || !destinationLocation) && styles.buttonDisabled,
            ]}
            onPress={getRoute}
            disabled={!startLocation || !destinationLocation}>
            <Text style={styles.buttonText}>Get Directions</Text>
          </TouchableOpacity>

          {/* potentially for button to indoor map */}
          {/* <TouchableOpacity
            style={styles.indoorMapButton}
            onPress={() => navigation.navigate('IndoorMap')}>
            <Ionicons name="business" size={24} color="#007AFF" />
            <Text style={styles.indoorMapButtonText}>Indoor Map</Text>
          </TouchableOpacity> */}
        </View>

        <Mapbox.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={Mapbox.StyleURL.Street}
          onDidFinishLoadingMap={() => {
            if (currentLocation.latitude && currentLocation.longitude) {
              centerMap([currentLocation.longitude, currentLocation.latitude]);
            }
          }}>
          <Mapbox.Camera
            ref={cameraRef}
            zoomLevel={15}
            centerCoordinate={[startLocation.longitude, startLocation.latitude]}
            animationMode="flyTo"
            animationDuration={2000}
          />

          <Mapbox.UserLocation visible={true} />

          {/* Building Overlays */}
          {CAMPUS_BUILDINGS[selectedCampus].map((building, index) => (
            <Mapbox.ShapeSource
              key={index.toString()}
              id={`building-${index}`}
              shape={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [building.coordinates],
                },
              }}>
              <Mapbox.FillLayer
                id={`building-fill-${index}`}
                style={{
                  fillColor: '#800020',
                  fillOpacity: 0.5,
                }}
              />
              <Mapbox.LineLayer
                id={`building-line-${index}`}
                style={{
                  lineColor: '#800020',
                  lineWidth: 2,
                }}
              />
            </Mapbox.ShapeSource>
          ))}

          <Mapbox.MarkerView
            id="start"
            coordinate={[startLocation.longitude, startLocation.latitude]}>
            <View style={[styles.marker, styles.startMarker]} />
          </Mapbox.MarkerView>

          {destinationLocation && (
            <Mapbox.MarkerView
              id="end"
              coordinate={[destinationLocation.longitude, destinationLocation.latitude]}>
              <View style={[styles.marker, styles.endMarker]} />
            </Mapbox.MarkerView>
          )}

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
