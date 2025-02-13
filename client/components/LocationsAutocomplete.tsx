import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Location } from '@/modules/map/MapContext';
import { getLocations } from '@/modules/map/MapService';

export default function LocationsAutocomplete({
  query,
  callback,
}: Readonly<{
  query: string;
  callback: (location: Location) => void;
}>) {
  const [locations, setLocations] = useState<Location[]>([]);
  useEffect(() => {
    if (query) {
      getLocations(query).then((locations) => {
        setLocations(locations);
      });
    } else {
      setLocations([]);
    }
  }, [query]);

  if (locations.length === 0) {
    return null;
  }

  return (
    <View style={styles.locationsContainer}>
      {locations.map((location, index) => (
        <View
          key={`location-${index}`}
          style={styles.locationItem}
          onTouchEnd={() => {
            callback(location);
            setLocations([]);
          }}>
          <Text>{location.name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  locationsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    margin: 0,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    zIndex: 2,
    overflow: 'hidden',
  },
  locationItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 0,
  },
});
