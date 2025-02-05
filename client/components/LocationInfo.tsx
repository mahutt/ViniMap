import { MapState, useMap, Location } from '@/modules/map/MapContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, DevSettings } from 'react-native';
let apiKey = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY as string;

export function LocationInfo() {
  const { endLocation, setState, setEndLocation } = useMap();

  const [address, setAddress] = useState("15 rue de l'artiste");
  const [destLocation, setDestLocation] = useState<Location | null>(null);
  const [name, setName] = useState('No Name');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchLocationData();
  }, [endLocation]);

  async function fetchLocationData() {
    const radius = 40;
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${endLocation?.coordinates[1]},${endLocation?.coordinates[0]}&radius=${radius}&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      let coords = [
        data.results[0].geometry.location.lat,
        data.results[0].geometry.location.lng,
      ] as [number, number];

      if (data.results.length > 0) {
        setAddress(data.results[0]?.name || 'Address not available');
        setName(data.results[1]?.name || 'Name not available');

        setDestLocation({
          name: name,
          coordinates: coords || 'Coordinates not available',
        });

        let openOrNah = data.results[1].opening_hours;
        if (openOrNah) {
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  function getDirections() {
    setState(MapState.RoutePlanning);
    setEndLocation(destLocation);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => setState(MapState.Idle)}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
      <Text style={styles.nameText}>{name}</Text>
      <Text style={styles.addressText}>{address}</Text>
      <Text style={[styles.isOpen, { color: isOpen ? 'green' : 'red' }]}>
        {isOpen ? 'Open Now' : 'Closed Now'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={getDirections}>
        <Ionicons name="arrow-forward-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.text}>Directions</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ccc',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'black',
    fontSize: 20,
    lineHeight: 20,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  addressText: {
    fontSize: 16,
    color: 'gray',
  },
  isOpen: {
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#852C3A',
    paddingVertical: '3%',
    paddingHorizontal: '5%',
    borderRadius: 25,
    justifyContent: 'center',
    marginTop: '8%',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
