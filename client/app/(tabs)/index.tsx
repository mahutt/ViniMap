import { StyleSheet, View } from 'react-native';
import React from 'react';

// Relative import for iPhone build
import { SearchBar } from '../../components/SearchBar';
import MapView from '@/modules/map/MapView';

import PitchButton from '@/modules/map/PitchButton';

import { useMap, MapState } from '@/modules/map/MapContext';

import CenterLocationComponent from '@/components/ui/IconCenterLocation';

import { LocationInfo } from '@/components/LocationInfo';
import { RoutePlanner } from '@/components/RoutePlanner';

export default function HomeScreen() {
  const { state } = useMap();
  return (
    <View style={styles.container}>
      <MapView />
      {(state === MapState.Idle || state === MapState.Information) && (
        <>
          <SearchBar onSearch={(query) => console.log(query)} />
          <PitchButton />
        </>
      )}
      {state === MapState.Idle && <CenterLocationComponent />}
      {state === MapState.Information && <LocationInfo />}
      {state === MapState.RoutePlanning && <RoutePlanner />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
