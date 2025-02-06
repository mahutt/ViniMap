import { StyleSheet, View } from 'react-native';
import React from 'react';

//keep ../../comp... b/c it is needed to compile on irl iphone
import { SearchBar } from '../../components/SearchBar';
import MapView from '@/modules/map/MapView';
import { useMap, MapState } from '@/modules/map/MapContext';
import CenterLocationComponent from '@/components/ui/IconCenterLocation';

export default function HomeScreen() {
  const { state } = useMap();
  return (
    <View style={styles.container}>
      <MapView />
      {state === MapState.Idle && (
        <View style={styles.searchContainer}>
          <CenterLocationComponent />
          <SearchBar onSearch={(query) => console.log(query)} />
        </View>
      )}
      {state === MapState.RoutePlanning && <View></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
