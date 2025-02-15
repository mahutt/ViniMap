import { Location, MapState, useMap } from '@/modules/map/MapContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import LocationsAutocomplete from './LocationsAutocomplete';

export default function LocationInput({
  location,
  setLocation,
  ionIconName,
  placeholder,
  isStartLocation = false,
}: Readonly<{
  location: Location | null;
  setLocation: (location: Location) => void;
  ionIconName: 'pin-outline' | 'pin';
  placeholder: string;
  isStartLocation?: boolean;
}>) {
  const inputRef = React.useRef<TextInput>(null);
  const [query, setQuery] = React.useState<string>('');
  const [isFocused, setIsFocused] = React.useState(false);
  const { setState } = useMap();

  useEffect(() => {
    if (location && !isFocused) {
      setQuery(location.name ?? '');
    }
  }, [location, isFocused]);

  // to clear the input when its focused.
  const handleFocus = () => {
    setIsFocused(true);
    if (isStartLocation) {
      setQuery('');
    }
  };

  // will restore the location name when its blurred
  const handleBlur = () => {
    setIsFocused(false);
    if (location) {
      setQuery(location.name ?? '');
    }
  };

  return (
    <View style={styles.locationInputContainer}>
      <Ionicons name={ionIconName} size={16} color="#666" />
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={isStartLocation ? 'Tap to change from current location' : placeholder}
        placeholderTextColor="#666"
        value={query}
        autoCorrect={false}
        onChangeText={setQuery}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {isStartLocation && isFocused && query.length === 0 && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              setState(MapState.SelectingStartLocation);
              inputRef.current?.blur();
            }}>
            <Ionicons name="map-outline" size={20} color="#666" />
            <Text style={styles.optionText}>Choose on map</Text>
          </TouchableOpacity>
        </View>
      )}

      {isFocused && query.length > 0 && (
        <LocationsAutocomplete
          query={query}
          callback={(selectedLocation) => {
            setLocation(selectedLocation);
            setQuery(selectedLocation.name ?? '');
            inputRef.current?.blur();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  locationInputContainer: {
    position: 'relative',
    flex: 1,
    display: 'flex',
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
  optionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    zIndex: 2,
    marginTop: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#666',
  },
});
