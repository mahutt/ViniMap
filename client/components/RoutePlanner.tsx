import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Text,
  Animated,
  //   PanResponder,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MapState, useMap } from '@/modules/map/MapContext';
import { getRoute } from '@/modules/map/MapService';
import LocationInput from './LocationInput';

export function RoutePlanner() {
  const [durations, setDurations] = React.useState<{ [key: string]: number | null }>({
    walking: null,
    cycling: null,
    driving: null,
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

  useEffect(() => {
    if (startLocation && endLocation) {
      loadRouteFromCoordinates(startLocation.coordinates, endLocation.coordinates, selectedMode);
      calculateOptions();
    }
  }, [startLocation, endLocation, selectedMode]);

  const swapLocations = () => {
    setStartLocation(endLocation);
    setEndLocation(startLocation);
  };

  const calculateOptions = async () => {
    if (startLocation !== null && endLocation !== null) {
      try {
        const cyclingRoute = await getRoute(
          startLocation.coordinates,
          endLocation.coordinates,
          'cycling'
        );
        const drivingRoute = await getRoute(
          startLocation.coordinates,
          endLocation.coordinates,
          'driving'
        );
        const walkingRoute = await getRoute(
          startLocation.coordinates,
          endLocation.coordinates,
          'walking'
        );

        setDurations({
          walking: walkingRoute ? walkingRoute.duration : null,
          cycling: cyclingRoute ? cyclingRoute.duration : null,
          driving: drivingRoute ? drivingRoute.duration : null,
        });

        if (walkingRoute || cyclingRoute || drivingRoute) {
          setIsRouteFound(true);
          slideDown();
        } else {
          setIsRouteFound(false);
        }
      } catch (error) {
        console.error('Error setting route:', error);
      }
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
      case 'wheelchair':
        return (
          <MaterialCommunityIcons
            name="wheelchair-accessibility"
            size={24}
            color="#666"
            style={styles.modeIcon}
          />
        );
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
              {durations.walking !== null && <Text>{Math.round(durations.walking / 60)} min</Text>}
            </Pressable>
            <Pressable
              style={[
                styles.transportButton,
                isRouteFound && selectedMode === 'cycling' && styles.activeTransportButton,
              ]}
              onPress={() => handleTransportMode('cycling')}>
              <Ionicons name="bicycle-outline" size={24} color="#666" />
              {durations.cycling !== null && <Text>{Math.round(durations.cycling / 60)} min</Text>}
            </Pressable>
            <Pressable
              style={[
                styles.transportButton,
                isRouteFound && selectedMode === 'driving' && styles.activeTransportButton,
              ]}
              onPress={() => handleTransportMode('driving')}>
              <Ionicons name="car-outline" size={24} color="#666" />
              {durations.driving !== null && <Text>{Math.round(durations.driving / 60)} min</Text>}
            </Pressable>
            <Pressable
              style={[
                styles.transportButton,
                isRouteFound && selectedMode === 'wheelchair' && styles.activeTransportButton,
              ]}
              onPress={() => handleTransportMode('wheelchair')}>
              <MaterialCommunityIcons name="wheelchair-accessibility" size={24} color="#666" />
            </Pressable>
            <Pressable
              style={[
                styles.transportButton,
                isRouteFound && selectedMode === 'shuttle' && styles.activeTransportButton,
              ]}
              onPress={() => handleTransportMode('shuttle')}>
              <Ionicons name="bus-outline" size={24} color="#666" />
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
                  {durations[selectedMode] !== null ? Math.round(durations[selectedMode] / 60) : 0}{' '}
                  min{' '}
                </Text>
                <Text style={styles.infoText}>
                  ({durations[selectedMode] ? (durations[selectedMode] / 1000).toFixed(2) : 0} km){' '}
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
    padding: 15,
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
  transportButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeTransportButton: {
    backgroundColor: '#ddd',
    borderRadius: 20,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
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
    height: 220,
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
    alignItems: 'center',
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
  },

  modeIcon2: {
    marginTop: 5,
    alignSelf: 'center',
  },

  infoText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'left',
  },
  modeIcon: {
    alignSelf: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonIcon: {
    marginRight: 5,
  },
  startButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RoutePlanner;
