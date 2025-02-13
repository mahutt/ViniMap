import { Location } from '@/modules/map/MapContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import LocationsAutocomplete from './LocationsAutocomplete';
import { StartLocationSelector } from './StartLocation';

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
  const [showSelector, setShowSelector] = React.useState(false);

  useEffect(() => {
    if (location) {
      setQuery(location.name ?? '');
    }
  }, [location]);

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
        onChangeText={(query) => setQuery(query)}
        onFocus={() => {
          if (isStartLocation) {
            setShowSelector(true);
            inputRef.current?.blur();
          }
        }}
      />
      {isStartLocation && showSelector && (
        <StartLocationSelector onClose={() => setShowSelector(false)} />
      )}
      {!showSelector && query !== location?.name && (
        <LocationsAutocomplete
          query={query}
          callback={(location) => {
            setLocation(location);
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
});
