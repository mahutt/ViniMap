import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { MapState, useMap } from '@/modules/map/MapContext';
import { getRoute } from '@/modules/map/MapService';
import TransportModes from './ui/RoutePlanner Components/TransportModes';
import BottomFrame from './ui/RoutePlanner Components/BottomFrame';
import InputFields from './ui/RoutePlanner Components/InputFields';
import TaskFrame from './TaskFrame';
import { useTask } from '@/providers/TaskContext';
import TaskRouteHeader from './TaskRouteHeader';

const MODES = [
  { name: 'walking', icon: 'walk-outline' },
  { name: 'cycling', icon: 'bicycle-outline' },
  { name: 'driving', icon: 'car-outline' },
  { name: 'shuttle', icon: 'bus-outline' },
];
const INDOOR_MODES = [
  { name: 'handicap', icon: 'wheelchair' },
  { name: 'walking', icon: 'walk-outline' },
];

export function RoutePlanner() {
  const [durations, setDurations] = React.useState<{ [key: string]: number | null }>({
    walking: null,
    cycling: null,
    driving: null,
    shuttle: null,
    handicap: null,
  });

  const [distances, setDistances] = React.useState<{ [key: string]: number | null }>({
    walking: null,
    cycling: null,
    driving: null,
    shuttle: null,
    handicap: null,
  });

  const [selectedMode, setSelectedMode] = React.useState<string>('walking');
  const [isRouteFound, setIsRouteFound] = React.useState(false);

  const { isTaskPlanning } = useTask();

  const [selectedIndoorMode, setSelectedIndoorMode] = React.useState<string>('walking');

  const {
    loadRouteFromCoordinates,
    startLocation,
    setStartLocation,
    endLocation,
    userLocation,
    state,
    route,
    indoorMap,
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
        handicap: walkingRoute?.duration ?? null,
      });

      setDistances({
        walking: walkingRoute?.distance ?? null,
        cycling: cyclingRoute?.distance ?? null,
        driving: drivingRoute?.distance ?? null,
        shuttle: shuttleRoute?.distance ?? null,
        handicap: walkingRoute?.duration ?? null,
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
            await loadRouteFromCoordinates(
              startLocation,
              endLocation,
              selectedMode,
              selectedIndoorMode
            );
            calculateOptions();
          } catch (error) {
            console.error('Error loading route:', error);
          }
        };
        loadRoute();
      }
    }
  }, [
    startLocation,
    endLocation,
    selectedMode,
    selectedIndoorMode,
    calculateOptions,
    loadRouteFromCoordinates,
    state,
  ]);

  useEffect(() => {
    if (durations.shuttle == null && selectedMode === 'shuttle') {
      setSelectedMode('driving');
    }
  }, [durations, distances, selectedMode, selectedIndoorMode]);

  const getModeIcon = (modeName: string) => {
    const mode =
      indoorMap == null
        ? MODES.find((m) => m.name === modeName)
        : INDOOR_MODES.find((m) => m.name === modeName);

    if (!mode) return null;

    if (mode.name === 'handicap') {
      return <FontAwesome5 name="wheelchair" size={24} color="black" />;
    }

    return (
      <Ionicons
        name={mode.icon as 'walk-outline' | 'bicycle-outline' | 'car-outline' | 'bus-outline'}
        size={24}
        color="black"
      />
    );
  };

  const handleTransportMode = async (mode: string) => {
    if (indoorMap != null) {
      setSelectedIndoorMode(mode);
    } else {
      setSelectedMode(mode);
    }
  };

  return (
    <>
      {isTaskPlanning ? (
        <TaskRouteHeader />
      ) : (
        <View style={styles.inputContainer}>
          <View style={styles.locationRangeForm}>
            <InputFields />
            <TransportModes
              selectedMode={indoorMap == null ? selectedMode : selectedIndoorMode}
              onMode={handleTransportMode}
              durations={durations}
              isRouteFound={isRouteFound}
              modes={indoorMap == null ? MODES : INDOOR_MODES}
            />
          </View>
        </View>
      )}
      {route !== null && isTaskPlanning ? (
        <TaskFrame />
      ) : (
        <BottomFrame
          selectedMode={indoorMap == null ? selectedMode : selectedIndoorMode}
          modeIcon={getModeIcon(indoorMap == null ? selectedMode : selectedIndoorMode)}
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
