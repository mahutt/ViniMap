import ShuttleCalculatorService from '@/services/ShuttleCalculatorService';
import { Coordinates, Location } from './MapContext';
import { calculateEuclideanDistance } from './MapUtils';
import { Route } from './Types';

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string;
let GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY as string;

const PROXIMITY_COORDINTATES = {
  longitude: -73.57791396549962, // Concordia SGW Campus Longitude
  latitude: 45.495102086770814, // Concordia SGW Campus  Latitude
};

const getLocations = async (locationQuery: string): Promise<Location[]> => {
  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
      locationQuery
    )}&proximity=${PROXIMITY_COORDINTATES.longitude},${
      PROXIMITY_COORDINTATES.latitude
    }&access_token=${MAPBOX_ACCESS_TOKEN}`
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
): Promise<Route | null> => {
  if (mode === 'shuttle') {
    return getRouteForShuttle(startCoordinates, endCoordinates);
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startCoordinates[0]},${startCoordinates[1]};${endCoordinates[0]},${endCoordinates[1]}?alternatives=false&annotations=duration,distance&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data?.routes[0]) {
    const route = data.routes[0];
    return {
      duration: route.duration,
      distance: route.distance,
      segments: [
        {
          id: mode,
          type: 'solid',
          steps: route.geometry.coordinates as Coordinates[],
        },
      ],
    };
  }
  return null;
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

const getRouteForShuttle = async (
  startCoordinates: Coordinates,
  endCoordinates: Coordinates
): Promise<Route | null> => {
  const MAX_EUCLIDEAN_DISTANCE = 0.01508;

  const SgwCoords: Coordinates = [-73.5784711, 45.4970661];
  const LoyolaCoords: Coordinates = [-73.6393324, 45.4577857];

  let startBusStop: Coordinates = [0, 0];
  let endBusStop: Coordinates = [0, 0];

  let isStartSgw = false;
  let isStartLoyola = false;
  let isEndSgw = false;
  let isEndLoyola = false;

  const distanceToShuttleSgwFromStart = calculateEuclideanDistance(SgwCoords, startCoordinates);
  const distanceToShuttleLoyolaFromStart = calculateEuclideanDistance(
    LoyolaCoords,
    startCoordinates
  );
  const distanceToShuttleSgwFromEnd = calculateEuclideanDistance(SgwCoords, endCoordinates);
  const distanceToShuttleLoyolaFromEnd = calculateEuclideanDistance(LoyolaCoords, endCoordinates);

  if (distanceToShuttleSgwFromStart <= MAX_EUCLIDEAN_DISTANCE) {
    isStartSgw = true;
    startBusStop = SgwCoords;
  }
  if (distanceToShuttleLoyolaFromStart <= MAX_EUCLIDEAN_DISTANCE) {
    isStartLoyola = true;
    startBusStop = LoyolaCoords;
  }
  if (distanceToShuttleSgwFromEnd <= MAX_EUCLIDEAN_DISTANCE) {
    isEndSgw = true;
    endBusStop = SgwCoords;
  }
  if (distanceToShuttleLoyolaFromEnd <= MAX_EUCLIDEAN_DISTANCE) {
    isEndLoyola = true;
    endBusStop = LoyolaCoords;
  }

  if (!((isStartLoyola && isEndSgw) || (isStartSgw && isEndLoyola))) {
    return null;
  }

  const start_Walk_ShuttleStart = await getRoute(startCoordinates, startBusStop, 'walking');
  const shuttleStart_Drive_shuttleEnd = await getRoute(startBusStop, endBusStop, 'driving');
  const shuttleEnd_Walk_end = await getRoute(endBusStop, endCoordinates, 'walking');

  if (!start_Walk_ShuttleStart || !shuttleStart_Drive_shuttleEnd || !shuttleEnd_Walk_end) {
    return null;
  }

  const firstWalkCoords = start_Walk_ShuttleStart?.segments[0].steps ?? [];
  const shuttleCoordinates = shuttleStart_Drive_shuttleEnd?.segments[0].steps ?? [];
  const secondWalkCoordinates = shuttleEnd_Walk_end?.segments[0].steps ?? [];

  const daysMap: { [key: number]: string } = {
    1: 'Monday-Thursday',
    2: 'Monday-Thursday',
    3: 'Monday-Thursday',
    4: 'Monday-Thursday',
    5: 'Friday',
  };
  const today = new Date().getDay();
  const dayKey = daysMap[today] ?? 'Monday-Thursday';
  const currentTime = ShuttleCalculatorService.getCurrentTime();

  const departureCampus: 'LOY' | 'SGW' = isStartSgw ? 'SGW' : 'LOY';
  const nextShuttleDuration = ShuttleCalculatorService.getNextDepartureTime(
    dayKey,
    currentTime,
    departureCampus
  );

  const shuttleDurationInSeconds =
    Number(nextShuttleDuration.replace('m', '').replace('h', '')) *
    (nextShuttleDuration.includes('h') ? 3600 : 60);

  if (isNaN(Number(shuttleDurationInSeconds))) {
    return null;
  }

  const finalDuration =
    Number(start_Walk_ShuttleStart.duration) +
    Number(shuttleStart_Drive_shuttleEnd.duration) +
    Number(shuttleEnd_Walk_end.duration) +
    shuttleDurationInSeconds;

  const finalDistance =
    Number(start_Walk_ShuttleStart.distance) +
    Number(shuttleStart_Drive_shuttleEnd.distance) +
    Number(shuttleEnd_Walk_end.distance);

  return {
    duration: finalDuration,
    distance: finalDistance,
    segments: [
      {
        id: 'firstWalk',
        type: 'dashed',
        steps: firstWalkCoords,
      },
      {
        id: 'shuttle',
        type: 'solid',
        steps: shuttleCoordinates,
      },
      {
        id: 'secondWalk',
        type: 'dashed',
        steps: secondWalkCoordinates,
      },
    ],
  };
};

const formatDuration = (seconds: number | null): string => {
  if (seconds === null) return 'Unavailable';
  const minutes = Math.round(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes} min`;
};

export { getLocations, getRoute, fetchLocationData, formatDuration };
