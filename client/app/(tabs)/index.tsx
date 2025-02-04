import { StyleSheet, View } from 'react-native';
import React from 'react';

import { SearchBar } from '@/components/SearchBar';
import MapView from '@/modules/map/MapView';
import { useMap, MapState } from '@/modules/map/MapContext';
import ToggleCampusButton from '@/components/ui/ToggleCampusButton';



export default function HomeScreen() {
  const { state } = useMap();
  
  return (
    <View style={styles.container}>
      <MapView />
      {state === MapState.Idle && (
        <View style={styles.searchContainer}>
          <SearchBar onSearch={(query) => console.log(query)} />
          
        </View>
      )}
      {state === MapState.RoutePlanning && <View></View>}
      <ToggleCampusButton style={styles.toggleButton} />
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
  toggleButton: {
    position: 'absolute',
    top: 125, // Adjust as needed
    left: 190, // Adjust as needed
    right: 20, // Adjust as needed
    zIndex: 2, // Ensure it stays on top
  },
});
