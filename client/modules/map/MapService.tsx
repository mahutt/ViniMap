import { Coordinates, Location } from './MapContext';
const ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const getLocationCoordinates = async (locationQuery: string): Promise<Location | null> => {
  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
      locationQuery
    )}&access_token=${ACCESS_TOKEN}`
  );
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

const getRoute = async (
  startCoordinates: Coordinates,
  endCoordinates: Coordinates
): Promise<Coordinates[] | null> => {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoordinates[0]},${startCoordinates[1]};${endCoordinates[0]},${endCoordinates[1]}?geometries=geojson&access_token=${ACCESS_TOKEN}`
  );
  const data = await response.json();
  if (data?.routes[0]) {
    return data.routes[0].geometry.coordinates as Coordinates[];
  }
  return null;
};

export { getLocationCoordinates, getRoute };
