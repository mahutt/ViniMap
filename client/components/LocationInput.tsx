import { Location } from '@/modules/map/MapContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import LocationsAutocomplete from './LocationsAutocomplete';

export default function LocationInput({
  location,
  setLocation,
  ionIconName,
  placeholder,
}: Readonly<{
  location: Location | null;
  setLocation: (location: Location) => void;
  ionIconName: 'pin-outline' | 'pin';
  placeholder: string;
}>) {
  const inputRef = React.useRef<TextInput>(null);
  const [query, setQuery] = React.useState<string>('');

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
        onChangeText={(query) => setQuery(query)}
      />
      {query !== location?.name && (
        <LocationsAutocomplete
          query={query}
          callback={(location) => {
            setLocation(location);
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
});
