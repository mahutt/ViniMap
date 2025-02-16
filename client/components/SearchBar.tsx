import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LocationsAutocomplete from './LocationsAutocomplete';
import { useMap, MapState } from '@/modules/map/MapContext';

export function SearchBar() {
  const { endLocation, setEndLocation, setState, flyTo } = useMap();
  const [query, setQuery] = React.useState<string>('');
  const textInputRef = React.useRef<TextInput>(null);

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          ref={textInputRef}
          style={styles.input}
          placeholder="Search here"
          placeholderTextColor="#666"
          value={query}
          onChangeText={(newQuery) => setQuery(newQuery)}
          autoCorrect={false}
        />
        {query !== '' && query !== endLocation?.name && (
          <LocationsAutocomplete
            query={query}
            callback={(location) => {
              setQuery(location.name ?? '');
              setEndLocation(location);
              // setState(MapState.Information);
              flyTo(location.coordinates, 17);
              setTimeout(() => {
                textInputRef.current?.blur();
              }, 0);
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    top: 76,
    left: 36,
    right: 36,
    zIndex: 3,
  },
  searchBar: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: 10,
  },
});
