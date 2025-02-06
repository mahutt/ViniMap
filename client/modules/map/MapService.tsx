import { Coordinates, Location } from './MapContext';
const ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const getLocationCoordinates = async (locationQuery: string): Promise<Location | null> => {
  try {
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
      locationQuery
    )}&access_token=${ACCESS_TOKEN}`;
    console.log('Fetching location coordinates:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Location coordinates response:', data);
    if (data?.features[0]) {
      const feature = data.features[0];
      return {
        name: locationQuery,
        coordinates: feature.geometry.coordinates as Coordinates,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching location coordinates:', error);
    return null;
  }
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
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startCoordinates[0]},${startCoordinates[1]};${endCoordinates[0]},${endCoordinates[1]}?alternatives=false&annotations=duration,distance&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${ACCESS_TOKEN}`;
    console.log('Fetching route:', url);
    const response = await fetch(url);
    const data = await response.json();
    console.log('Route response:', data);
    if (data?.routes[0]) {
      const route = data.routes[0];
      return {
        coordinates: route.geometry.coordinates as Coordinates[],
        duration: route.duration,
        distance: route.distance,
      };
    }
    return { coordinates: null, duration: null, distance: null };
  } catch (error) {
    console.error('Error fetching route:', error);
    return { coordinates: null, duration: null, distance: null };
  }
};

export { getLocationCoordinates, getRoute };
