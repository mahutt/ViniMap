import { Coordinates, Location } from './MapContext';
const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string;
let GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY as string;

const getLocationCoordinates = async (locationQuery: string): Promise<Location | null> => {
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
    locationQuery
  )}&access_token=${MAPBOX_ACCESS_TOKEN}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data?.features[0]) {
    const feature = data.features[0];
    return {
      name: locationQuery,
      coordinates: feature.geometry.coordinates as Coordinates,
    };
  }
  return null;
};

const getLocations = async (locationQuery: string): Promise<Location[]> => {
  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
      locationQuery
    )}&access_token=${MAPBOX_ACCESS_TOKEN}`
  );
  const data = await response.json();
  if (data?.features) {
    return data.features.map((feature: any) => ({
      name: `${feature.properties.name}, ${feature.properties.place_formatted ?? ''}`,
      coordinates: feature.geometry.coordinates as Coordinates,
    }));
  }
  return [];
};

const getRoute = async (
  startCoordinates: Coordinates,
  endCoordinates: Coordinates,
  mode: string
): Promise<{
  coordinates: Coordinates[] | null;
  duration: number | null;
  distance: number | null;
}> => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startCoordinates[0]},${startCoordinates[1]};${endCoordinates[0]},${endCoordinates[1]}?alternatives=false&annotations=duration,distance&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data?.routes[0]) {
    const route = data.routes[0];
    return {
      coordinates: route.geometry.coordinates as Coordinates[],
      duration: route.duration,
      distance: route.distance,
    };
  }
  return { coordinates: null, duration: null, distance: null };
};

const fetchLocationData = async (coordinates: Coordinates) => {
  const radius = 50;
  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates[1]},${coordinates[0]}&radius=${radius}&key=${GOOGLE_API_KEY}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.results.length > 0) {
      return {
        address: data.results[0]?.name || 'Address not available',
        name: data.results[1]?.name || 'Name not available',
        isOpen: Boolean(data.results[1].opening_hours),
      };
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

export { getLocationCoordinates, getLocations, getRoute, fetchLocationData };
