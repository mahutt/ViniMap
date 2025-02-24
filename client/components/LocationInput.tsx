import { Location, MapState, useMap } from '@/modules/map/MapContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import LocationsAutocomplete from './LocationsAutocomplete';
import CoordinateService from '@/services/CoordinateService';

const CURRENT_LOCATION_NAME = 'Current location';

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
    if (location) {
      setQuery(location.name ?? '');
    }
  }, [location]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (location) {
      setQuery(location.name ?? '');
    }
  };

  const handleCurrentLocation = async () => {
    if (isStartLocation) {
      try {
        const tempCoordinates = await CoordinateService.getCurrentCoordinates();
        if (tempCoordinates) {
          setLocation({
            name: CURRENT_LOCATION_NAME,
            coordinates: tempCoordinates,
          });
          inputRef.current?.blur();
        }
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    }
  };

  // helper functions
  const shouldShowMapPrompt = () => {
    if (!isFocused) return false;
    if (query === '') return true;
    if (query === location?.name) return true;
    return false;
  };

  const shouldShowAutocomplete = () => {
    if (!isFocused) return false;
    if (query !== '' && query !== location?.name) return true;
    return false;
  };

  return (
    <View style={styles.locationInputContainer}>
      <Ionicons name={ionIconName} size={16} color="#666" />
      <TextInput
        ref={inputRef}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={query}
        autoCorrect={false}
        onChangeText={setQuery}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {shouldShowMapPrompt() && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => {
              setState(
                isStartLocation ? MapState.SelectingStartLocation : MapState.SelectingEndLocation
              );
            }}>
            <Ionicons name="map-outline" size={20} color="#666" />
            <Text style={styles.optionText}>Choose on map</Text>
          </TouchableOpacity>
          {isStartLocation && location?.name !== CURRENT_LOCATION_NAME && (
            <TouchableOpacity style={styles.optionItem} onPress={handleCurrentLocation}>
              <Ionicons name="locate-outline" size={20} color="#666" />
              <Text style={styles.optionText}>Use Current Location</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {shouldShowAutocomplete() && (
        <LocationsAutocomplete
          query={query}
          callback={(selectedLocation) => {
            setLocation(selectedLocation);
            setQuery(selectedLocation.name ?? '');
            setTimeout(() => {
              inputRef.current?.blur();
            }, 0);
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
