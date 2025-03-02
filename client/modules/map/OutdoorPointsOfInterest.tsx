import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useMap, Location } from './MapContext';
import { getOutdoorPointsOfInterest } from './MapService';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// Fix Mapbox imports
import Mapbox from '@rnmapbox/maps';
// For react-native-maps, use proper type import
import type MapView from 'react-native-maps';

// Combine both map types for the ref
type CombinedMapRef = React.RefObject<MapView | Mapbox.MapView | null>;

interface POILocation extends Location {
  details?: {
    place_id?: string;
    vicinity?: string;
    rating?: number;
    user_ratings_total?: number;
  };
}

interface OutdoorPOIProps {
  radius?: number;
}

const OutdoorPointsOfInterest: React.FC<OutdoorPOIProps> = ({ radius = 5000 }) => {
  const { mapRef, centerCoordinate, setEndLocation } = useMap();

  const [outdoorLocations, setOutdoorLocations] = useState<POILocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPOI, setSelectedPOI] = useState<POILocation | null>(null);

  useEffect(() => {
    if (centerCoordinate) {
      fetchOutdoorPOIs();
    }
  }, [centerCoordinate]);

  const fetchOutdoorPOIs = async () => {
    if (!centerCoordinate) return;

    try {
      setLoading(true);

      // This is the issue - need to modify parameters or cast to expected type
      // Assuming getOutdoorPointsOfInterest expects coordinates directly, not a Location object
      const places = await getOutdoorPointsOfInterest(centerCoordinate, radius);

      // Alternatively, if your getOutdoorPointsOfInterest is expecting a Location object:
      // const currentLocation: Location = {
      //   coordinates: centerCoordinate,
      //   name: 'Current Location',
      // };
      // const places = await getOutdoorPointsOfInterest(currentLocation, radius);

      setOutdoorLocations(places);
    } catch (error) {
      console.error('Error fetching outdoor POIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePOIPress = (location: POILocation) => {
    setSelectedPOI(location);
    setEndLocation?.(location);

    // Check if this is a react-native-maps MapView
    if (mapRef?.current && 'animateToRegion' in mapRef.current) {
      // For react-native-maps
      (mapRef.current as any).animateToRegion(
        {
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    } else if (mapRef?.current && 'setCamera' in mapRef.current) {
      // For Mapbox maps - modify this to match Mapbox's expected API
      (mapRef.current as any).setCamera({
        centerCoordinate: [location.coordinates[0], location.coordinates[1]],
        zoomLevel: 15,
        animationDuration: 500,
      });
    }
  };

  const renderPOIItem = ({ item }: { item: POILocation }) => (
    <TouchableOpacity style={styles.poiItem} onPress={() => handlePOIPress(item)}>
      <ThemedText style={styles.poiName}>{item.name}</ThemedText>
      {item.details?.vicinity && (
        <ThemedText style={styles.poiVicinity}>{item.details.vicinity}</ThemedText>
      )}
      {item.details?.rating && (
        <View style={styles.ratingContainer}>
          <ThemedText style={styles.ratingText}>{item.details.rating.toFixed(1)}</ThemedText>
          <ThemedText style={styles.ratingCount}>
            ({item.details.user_ratings_total || 0} reviews)
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Map Markers for Outdoor POIs */}
      {outdoorLocations.map((location) => (
        <Mapbox.PointAnnotation
          key={
            location.details?.place_id || `${location.coordinates[0]}-${location.coordinates[1]}`
          }
          id={location.details?.place_id || `${location.coordinates[0]}-${location.coordinates[1]}`}
          coordinate={[location.coordinates[0], location.coordinates[1]]}
          onSelected={() => handlePOIPress(location)}>
          <View style={styles.markerContainer}>
            <View style={styles.marker} />
          </View>
          <Mapbox.Callout title={location.name || 'Location'} />
        </Mapbox.PointAnnotation>
      ))}

      {/* POI List in Bottom Sheet */}
      <ThemedView style={styles.bottomSheet}>
        <View style={styles.bottomSheetHeader}>
          <ThemedText style={styles.bottomSheetTitle}>Outdoor Points of Interest</ThemedText>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066FF" />
            <ThemedText style={styles.loadingText}>Finding outdoor places near you...</ThemedText>
          </View>
        ) : outdoorLocations.length > 0 ? (
          <FlatList
            data={outdoorLocations}
            renderItem={renderPOIItem}
            keyExtractor={(item) =>
              item.details?.place_id || `${item.coordinates[0]}-${item.coordinates[1]}`
            }
            style={styles.poiList}
            contentContainerStyle={styles.poiListContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No outdoor places found nearby. Try increasing the search radius.
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#852C3A',
    borderColor: 'white',
    borderWidth: 2,
  },
  poiItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  poiName: {
    fontSize: 16,
    fontWeight: '600',
  },
  poiVicinity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFB400',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    maxHeight: '30%',
  },
  bottomSheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  poiList: {
    flexGrow: 0,
  },
  poiListContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
  },
});

export default OutdoorPointsOfInterest;
