import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapState, useMap } from '@/modules/map/MapContext';
import { getRoute } from '@/modules/map/MapService';
import TransportModes from './ui/RoutePlanner Components/TransportModes';
import BottomFrame from './ui/RoutePlanner Components/BottomFrame';
import InputFields from './ui/RoutePlanner Components/InputFields';
import TaskFrame from './TaskFrame';
import { useTask } from '@/providers/TaskContext';

const MODES = [
  { name: 'walking', icon: 'walk-outline' },
  { name: 'cycling', icon: 'bicycle-outline' },
  { name: 'driving', icon: 'car-outline' },
  { name: 'shuttle', icon: 'bus-outline' },
];

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

  const { isTaskPlanning } = useTask();

  const {
    loadRouteFromCoordinates,
    startLocation,
    setStartLocation,
    endLocation,
    userLocation,
    state,
    route,
    flyTo,
  } = useMap();

  const calculateOptions = useCallback(async () => {
    if (!startLocation || !endLocation) return;

    try {
      const routes = await Promise.all(
        MODES.map((mode) => getRoute(startLocation, endLocation, mode.name))
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
    } catch (error) {
      console.error('Error setting route:', error);
    }
  }, [startLocation, endLocation]);

  useEffect(() => {
    if (state === MapState.RoutePlanning && !startLocation) {
      setStartLocation(userLocation);
    }
  }, [state, startLocation, setStartLocation, userLocation]);

  useEffect(() => {
    if (state === MapState.RoutePlanning) {
      if (startLocation && endLocation) {
        const loadRoute = async () => {
          try {
            await loadRouteFromCoordinates(startLocation, endLocation, selectedMode);
            calculateOptions();
          } catch (error) {
            console.error('Error loading route:', error);
          }
        };
        loadRoute();
      }
    }
  }, [startLocation, endLocation, selectedMode, calculateOptions, loadRouteFromCoordinates, state]);

  useEffect(() => {
    if (durations.shuttle == null && selectedMode === 'shuttle') {
      setSelectedMode('driving');
    }
  }, [durations, distances, selectedMode]);

  const getModeIcon = (modeName: string) => {
    const mode = MODES.find((m) => m.name === modeName);
    if (!mode) return null;
    return (
      <Ionicons
        name={mode.icon as 'walk-outline' | 'bicycle-outline' | 'car-outline' | 'bus-outline'}
        size={24}
        color="black"
      />
    );
  };

  const handleTransportMode = async (mode: string) => {
    setSelectedMode(mode);
  };

  return (
    <>
      <View style={styles.inputContainer}>
        <View style={styles.locationRangeForm}>
          <InputFields />
          <TransportModes
            selectedMode={selectedMode}
            onMode={handleTransportMode}
            durations={durations}
            isRouteFound={isRouteFound}
            modes={MODES}
          />
        </View>
      </View>

      {route !== null && isTaskPlanning ? (
        <TaskFrame />
      ) : (
        <BottomFrame
          selectedMode={selectedMode}
          modeIcon={getModeIcon(selectedMode)}
          durations={durations}
          distances={distances}
        />
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
  locationRangeForm: {
    paddingHorizontal: 20,
    flexDirection: 'column',
    gap: 10,
  },
});

export default RoutePlanner;
