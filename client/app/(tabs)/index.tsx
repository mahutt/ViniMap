import { StyleSheet, View } from 'react-native';
import React from 'react';

// Relative import for iPhone build
import { SearchBar } from '../../components/SearchBar';
import MapView from '@/modules/map/MapView';

import PitchButton from '@/modules/map/PitchButton';

import { useMap, MapState } from '@/modules/map/MapContext';

import CenterLocationButton from '@/components/ui/CenterLocationButton';
import { LocationInfo } from '@/components/LocationInfo';
import { RoutePlanner } from '@/components/RoutePlanner';
import ToggleCampusButton from '@/components/ui/ToggleCampusButton';
import MapHint from '@/components/MapHint';
import FloorControl from '@/components/FloorControl';

export default function HomeScreen() {
  const { state } = useMap();

  return (
    <View style={styles.container}>
      <MapView />
      {(state === MapState.Idle || state === MapState.Information) && (
        <>
          <SearchBar />
          <PitchButton />
          <ToggleCampusButton />
        </>
      )}
      {state === MapState.Idle && <CenterLocationButton />}
      {state === MapState.Information && <LocationInfo />}
      {(state === MapState.RoutePlanning || state === MapState.TaskNavigation) && <RoutePlanner />}
      <MapHint />
      <FloorControl />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
