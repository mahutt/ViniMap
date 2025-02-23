import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Coordinates, MapState, useMap } from '@/modules/map/MapContext';
import { getRoute, formatDuration } from '@/modules/map/MapService';
import LocationInput from './LocationInput';
import CoordinateService from '@/services/CoordinateService';

export function RoutePlanner() {
  const [durations, setDurations] = React.useState<{ [key: string]: number | null }>({
    walking: null,
    cycling: null,
    driving: null,
    shuttle: null,
  });

  const [distances, setDistances] = React.useState<{ [key: string]: number | null }>({
    walking: null,
    cycling: null,
    driving: null,
    shuttle: null,
  });

  const [selectedMode, setSelectedMode] = React.useState<string>('walking');
  const [isRouteFound, setIsRouteFound] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(500)).current;

  const {
    setState,
    loadRouteFromCoordinates,
    startLocation,
    setStartLocation,
    endLocation,
    setEndLocation,
  } = useMap();

  const centerMapOnUserLocation = async () => {
    const tempCoordinates: Coordinates = (await CoordinateService.getCurrentCoordinates()) ?? [
      0, 0,
    ];

    setStartLocation({
      name: 'Current location',
      coordinates: tempCoordinates,
    });
  };

  useEffect(() => {
    if (!startLocation) {
      centerMapOnUserLocation();
    } else if (startLocation && endLocation) {
      loadRouteFromCoordinates(startLocation.coordinates, endLocation.coordinates, selectedMode);
      calculateOptions();
    }
  }, [startLocation, endLocation, selectedMode]);

  useEffect(() => {
    if (durations.shuttle == null && selectedMode == 'shuttle') {
      setSelectedMode('driving');
    }
  }, [durations, distances]);

  const swapLocations = () => {
    setStartLocation(endLocation);
    setEndLocation(startLocation);
  };

  const calculateOptions = async () => {
    if (!startLocation || !endLocation) return;

    try {
      const modes = ['walking', 'cycling', 'driving', 'shuttle'];
      const routes = await Promise.all(
        modes.map((mode) => getRoute(startLocation.coordinates, endLocation.coordinates, mode))
      );

      const [walkingRoute, cyclingRoute, drivingRoute, shuttleRoute] = routes;

      setDurations({
        walking: walkingRoute?.duration ?? null,
        cycling: cyclingRoute?.duration ?? null,
        driving: drivingRoute?.duration ?? null,
        shuttle: shuttleRoute?.duration ?? null,
      });

      setDistances({
        walking: walkingRoute?.distance ?? null,
        cycling: cyclingRoute?.distance ?? null,
        driving: drivingRoute?.distance ?? null,
        shuttle: shuttleRoute?.distance ?? null,
      });

      setIsRouteFound(!!(walkingRoute || cyclingRoute || drivingRoute));
      if (isRouteFound) slideDown();
    } catch (error) {
      console.error('Error setting route:', error);
    }
  };

  const handleTransportMode = async (profile: string) => {
    setSelectedMode(profile);
  };

  //   Future code for drawer slide up and down
  //   const slideUp = () => {
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }).start();
  //   };

  const slideDown = () => {
    Animated.timing(slideAnim, {
      toValue: 250,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  //   Future code for drawer slide up and down
  //   const panResponder = React.useRef(
  //     PanResponder.create({
  //       onMoveShouldSetPanResponder: (_, gestureState) => true,
  //       onPanResponderMove: (_, gestureState) => {
  //         slideAnim.setValue(Math.min(gestureState.dy, 500));
  //       },
  //       onPanResponderRelease: (_, gestureState) => {
  //         if (gestureState.dy > 100) {
  //           slideDown();
  //         } else {
  //           slideUp();
  //         }
  //       },
  //     })
  //   ).current;

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'walking':
        return <Ionicons name="walk-outline" size={24} color="#666" style={styles.modeIcon} />;
      case 'cycling':
        return <Ionicons name="bicycle-outline" size={24} color="#666" style={styles.modeIcon} />;
      case 'driving':
        return <Ionicons name="car-outline" size={24} color="#666" style={styles.modeIcon} />;
      case 'shuttle':
        return <Ionicons name="bus-outline" size={24} color="#666" style={styles.modeIcon} />;
      default:
        return null;
    }
  };

  return (
    <>
      <View style={styles.inputContainer}>
        <View style={styles.locationRangeForm}>
          <View style={styles.locationRangeFormRow}>
            <LocationInput
              location={startLocation}
              setLocation={setStartLocation}
              ionIconName="pin-outline"
              placeholder="Start location"
            />
            <Pressable onPress={() => setState(MapState.Idle)}>
              <Ionicons name="close-outline" size={28} color="#666" />
            </Pressable>
          </View>

          <View style={styles.locationRangeFormRow}>
            <LocationInput
              location={endLocation}
              setLocation={setEndLocation}
              ionIconName="pin"
              placeholder="End location"
            />
            <Pressable onPress={swapLocations}>
              <Ionicons name="swap-vertical-outline" size={28} color="#666" />
            </Pressable>
          </View>

          <ScrollView horizontal contentContainerStyle={styles.transportModeContainer}>
            <Pressable
              style={[
                styles.transportButton,
                isRouteFound && selectedMode === 'walking' && styles.activeTransportButton,
              ]}
              onPress={() => handleTransportMode('walking')}>
              <Ionicons name="walk-outline" size={24} color="#666" />
              <Text>{durations.walking !== null ? formatDuration(durations.walking) : ''}</Text>
            </Pressable>

            <Pressable
              style={[
                styles.transportButton,
                isRouteFound && selectedMode === 'cycling' && styles.activeTransportButton,
              ]}
              onPress={() => handleTransportMode('cycling')}>
              <Ionicons name="bicycle-outline" size={24} color="#666" />
              <Text>{durations.cycling !== null ? formatDuration(durations.cycling) : ''}</Text>
            </Pressable>

            <Pressable
              style={[
                styles.transportButton,
                isRouteFound && selectedMode === 'driving' && styles.activeTransportButton,
              ]}
              onPress={() => handleTransportMode('driving')}>
              <Ionicons name="car-outline" size={24} color="#666" />
              <Text>{durations.driving !== null ? formatDuration(durations.driving) : ''}</Text>
            </Pressable>

            <Pressable
              style={[
                styles.transportButton,
                isRouteFound && selectedMode === 'shuttle' && styles.activeTransportButton,
                durations.shuttle === null && styles.disabledTransportButton,
              ]}
              onPress={() => handleTransportMode('shuttle')}
              disabled={durations.shuttle === null}>
              <Ionicons
                name="bus-outline"
                size={24}
                color={durations.shuttle === null ? '#999' : '#666'}
              />
              <Text
                style={[styles.durationText, durations.shuttle === null && styles.unavailableText]}>
                {durations.shuttle !== null ? formatDuration(Number(durations.shuttle)) : ''}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>

      {isRouteFound && (
        <Animated.View
          style={[
            styles.infoContainer,
            // { transform: [{ translateY: slideAnim }] },
          ]}
          //{...panResponder.panHandlers}
        >
          <View style={styles.infoWrapper}>
            <View style={styles.slideIndicator} />
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                <Text style={styles.boldText}>
                  {durations[selectedMode] !== null ? formatDuration(durations[selectedMode]) : 0}{' '}
                </Text>
                <Text style={styles.infoText}>
                  ({(Number(distances[selectedMode]) / 1000).toFixed(2)} km){' '}
                </Text>
                <View style={styles.modeIcon2}>{getModeIcon(selectedMode)}</View>
              </Text>
              <Pressable style={styles.startButton} onPress={() => {}}>
                <Ionicons
                  name="navigate-outline"
                  size={16}
                  color="white"
                  style={styles.startButtonIcon}
                />
                <Text style={styles.startButtonText}>Start</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  inputContainer: {
    position: 'absolute',
    paddingTop: 70,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'white',
    paddingVertical: 10,
  },
  mapContainer: {
    flex: 1,
  },
  locationRangeForm: {
    paddingHorizontal: 20,
    flexDirection: 'column',
    gap: 10,
  },
  locationRangeFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  transportModeContainer: {
    paddingVertical: 2,
    paddingHorizontal: 15,
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
  transportButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 1,
  },
  activeTransportButton: {
    backgroundColor: '#ddd',
    borderRadius: 20,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 5,
    elevation: 5,
    height: 160,
    alignItems: 'flex-start',
  },
  boldText: {
    fontWeight: 'bold',
  },
  infoWrapper: {
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 0,
    padding: 10,
  },
  slideIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    marginBottom: 20,
    alignSelf: 'center',
  },
  infoContent: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    width: '100%',
  },
  modeIcon2: {
    marginTop: 5,
    alignSelf: 'center',
  },
  infoText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'left',
    marginBottom: 10,
  },
  modeIcon: {
    alignSelf: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#852C3A',
    paddingVertical: '3%',
    paddingHorizontal: '5%',
    borderRadius: 25,
    justifyContent: 'center',
    marginTop: '4%',
  },
  startButtonIcon: {
    marginRight: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  durationText: {
    fontSize: 14,
    color: '#333',
    marginTop: 1,
    textAlign: 'center',
  },
  unavailableText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 10,
  },
  disabledTransportButton: {
    opacity: 0.5,
  },
});

export default RoutePlanner;
