import { StyleSheet, View } from 'react-native';
import React from 'react';

import { SearchBar } from '@/components/SearchBar';
import MapView from '@/modules/map/MapView';

import PitchButton from '@/modules/map/PitchButton';

import { useMap, MapState } from '@/modules/map/MapContext';
import { LocationInfo } from '@/components/LocationInfo';
import { RoutePlanner } from '@/components/RoutePlanner';
import ToggleCampusButton from '@/components/ui/ToggleCampusButton';

export default function HomeScreen() {
  const { state } = useMap();
  return (
    <View style={styles.container}>
      <MapView />
      {(state === MapState.Idle || state === MapState.Information) && (
        <>
          <SearchBar onSearch={(query) => console.log(query)} />
          <PitchButton></PitchButton>
          <ToggleCampusButton/>
        </>
      )}
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

