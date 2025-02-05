import React from 'react';
import { View, TextInput, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { MapState, useMap } from '@/modules/map/MapContext';
import MapView from '@/modules/map/MapView';

export function RoutePlanner() {
  const { setState, loadRoute, setMode } = useMap();
  const [startLocationQuery, setStartLocationQuery] = React.useState<string>('');
  const [endLocationQuery, setEndLocationQuery] = React.useState<string>('');

  const handleBlur = async () => {
    if (startLocationQuery && endLocationQuery) {
      try {
        await loadRoute(startLocationQuery, endLocationQuery, 'walking');
      } catch (error) {
        console.error("Error setting route: ", error);
      }
    }
  };

  const swapLocations = () => {
    setStartLocationQuery(endLocationQuery);
    setEndLocationQuery(startLocationQuery);
  };

  const handleTransportMode = async (profile: string) => {
    setMode(profile);
    if (startLocationQuery && endLocationQuery) {
      try {
        await loadRoute(startLocationQuery, endLocationQuery, profile);
      } catch (error) {
        console.error('Error setting route:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.locationRangeForm}>
          <View style={styles.locationRangeFormRow}>
            <View style={styles.locationInputContainer}>
              <Ionicons name="pin-outline" size={16} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="Start location"
                placeholderTextColor="#666"
                value={startLocationQuery}
                onChangeText={(query) => setStartLocationQuery(query)}
                onBlur={handleBlur}
              />
            </View>
            <Pressable onPress={() => setState(MapState.Idle)}>
              <Ionicons name="close-outline" size={28} color="#666" />
            </Pressable>
          </View>
          <View style={styles.locationRangeFormRow}>
            <View style={styles.locationInputContainer}>
              <Ionicons name="pin" size={16} color="#666" />
              <TextInput
                style={styles.input}
                placeholder="End location"
                placeholderTextColor="#666"
                value={endLocationQuery}
                onChangeText={(query) => setEndLocationQuery(query)}
                onBlur={handleBlur}
              />
            </View>
            <Pressable onPress={swapLocations}>
              <Ionicons name="swap-vertical-outline" size={28} color="#666" />
            </Pressable>
          </View>
        </View>
        <ScrollView horizontal contentContainerStyle={styles.transportModeContainer}>
          <Pressable style={styles.transportButton} onPress={() => handleTransportMode('walking')}>
            <Ionicons name="walk-outline" size={24} color="#666" />
          </Pressable>
          <Pressable style={styles.transportButton} onPress={() => handleTransportMode('cycling')}>
            <Ionicons name="bicycle-outline" size={24} color="#666" />
          </Pressable>
          <Pressable style={styles.transportButton} onPress={() => handleTransportMode('driving')}>
            <Ionicons name="car-outline" size={24} color="#666" />
          </Pressable>
          <Pressable style={styles.transportButton} onPress={() => handleTransportMode('wheelchair')}>
            <MaterialCommunityIcons name="wheelchair-accessibility" size={24} color="#666" />
          </Pressable>
          <Pressable style={styles.transportButton} onPress={() => handleTransportMode('shuttle')}>
            <Ionicons name="bus-outline" size={24} color="#666" />
          </Pressable>
        </ScrollView>
      </View>

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flex: 0,
    top:0,
    paddingTop: 70,
    backgroundColor: 'white',
  },
  inputContainer: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, 
    
  },
  mapContainer: {
    flex: 1,
  },
  locationRangeForm: {
    paddingHorizontal: 20,
    flexDirection: 'column',
    gap: 10,
  },
  locationRangeFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInputContainer: {
    flex: 1,
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
  transportModeContainer: {
    padding: 10,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly', 
    alignItems: 'center',
    width: '100%',
  },
  transportButton: {
    flex: 1, 
    alignItems: 'center',
  },
});

export default RoutePlanner;
