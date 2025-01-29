import { StyleSheet, View } from 'react-native';
import React from 'react';

import { SearchBar } from '@/components/SearchBar';
import Map from '@/modules/map/Map';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Map />
      <View style={styles.searchContainer}>
        <SearchBar onSearch={(query) => console.log(query)} />
      </View>
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
