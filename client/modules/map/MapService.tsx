import ShuttleCalculatorService from '@/services/ShuttleCalculatorService';
import { Coordinates } from './MapContext';
import { IndoorMap, Location, Route, Segment } from './Types';
import { calculateEuclideanDistance } from './MapUtils';
import { footwaysForLevel, getConnectionsBetween, getStartEndLevels } from './IndoorMapUtils';
import DijkstraService from '@/services/DijkstrasService';
import type { Feature, Point, Polygon, Position } from 'geojson';
import GeojsonHelper from '@/services/GeojsonService';

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN as string;
let GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY as string;

const PROXIMITY_COORDINTATES = {
  longitude: -73.57791396549962, // Concordia SGW Campus Longitude
  latitude: 45.495102086770814, // Concordia SGW Campus  Latitude
};

const RADIUS_OF_EARTH = 6371000; // Radius of the earth in meters
const AVERAGE_WALKING_SPEED = 1.39; // m/s

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
  startLocation: Location,
  endLocation: Location,
  mode: string
): Promise<Route | null> => {
  // If the start and end locations are in the same indoor map
  if (
    startLocation.data?.level &&
    endLocation.data?.level &&
    startLocation.data?.indoorMap &&
    endLocation.data?.indoorMap &&
    startLocation.data?.indoorMap?.id === endLocation.data?.indoorMap?.id
  ) {
    return getIndoorRoute(
      startLocation.data.indoorMap,
      startLocation.data.feature,
      endLocation.data.feature
    );
  }

  // If the start and end locations are in different different indoor maps
  if (
    startLocation.data?.level &&
    endLocation.data?.level &&
    startLocation.data?.indoorMap &&
    endLocation.data?.indoorMap &&
    startLocation.data?.indoorMap?.id !== endLocation.data?.indoorMap?.id
  ) {
    return getIndoorIndoorRoute(
      startLocation.data.feature,
      startLocation.data.indoorMap,
      endLocation.data.feature,
      endLocation.data.indoorMap,
      mode
    );
  }

  // If the start location is indoor and the end location is outdoor, or vice versa
  if (startLocation.data?.level && startLocation.data.indoorMap) {
    return await getIndoorOutdoorRoute(
      startLocation.data.feature,
      startLocation.data.indoorMap,
      endLocation,
      mode
    );
  } else if (endLocation.data?.level && endLocation.data.indoorMap) {
    return await getIndoorOutdoorRoute(
      endLocation.data.feature,
      endLocation.data.indoorMap,
      startLocation,
      mode
    );
  }

  const startCoordinates = startLocation.coordinates;
  const endCoordinates = endLocation.coordinates;
  if (mode === 'shuttle') {
    return getRouteForShuttle(startCoordinates, endCoordinates);
  }
  return getRouteFromMapbox(startCoordinates, endCoordinates, mode);
};

export const getIndoorRoute = (
  indoorMap: IndoorMap,
  startFeature: Feature<Point | Polygon>,
  endFeature: Feature<Point | Polygon>
): Route | null => {
  // Obtain the levels of the start and end features
  const startEndLevels = getStartEndLevels(startFeature, endFeature);
  if (!startEndLevels) return null;
  const [startLevel, endLevel] = startEndLevels;

  // stops is an array of features that the route will pass through,
  // which is only necessary if the start and end levels are different.
  // Intermediate stops are necessarily connections between levels.
  let stops: Feature<Point | Polygon>[] = [];
  if (startLevel === endLevel) {
    stops = [startFeature, endFeature];
  } else {
    const connections = getConnectionsBetween(startLevel, endLevel, indoorMap);
    if (connections.length === 0) {
      return null;
    }
    stops = [startFeature, ...connections, endFeature];
  }

  let distance = 0;
  const segments: Segment[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const start = stops[i];
    const end = stops[i + 1];
    const segmentLevels = getStartEndLevels(start, end);
    if (!segmentLevels) {
      return null;
    }
    const [segmentStartLevel, segmentEndLevel] = segmentLevels;

    // Based on how stops is constructed,
    // the start and end levels of each segment should be the same
    if (segmentStartLevel !== segmentEndLevel) return null;

    const footways = footwaysForLevel(indoorMap, segmentStartLevel);
    const startPositionOptions = GeojsonHelper.findLinesIntersect(footways, start);
    const endPositionOptions = GeojsonHelper.findLinesIntersect(footways, end);
    if (startPositionOptions.length === 0 || endPositionOptions.length === 0) {
      return null;
    }

    const startPosition = startPositionOptions[0];
    const endPosition = endPositionOptions[0];
    const steps = DijkstraService.findShortestPath(startPosition, endPosition, footways);
    if (!steps) {
      return null;
    }

    distance += getDistanceFromPositions(startPosition, endPosition);
    segments.push({
      id: `indoor-navigation-walk-${i}`,
      type: 'dashed',
      steps: steps as Coordinates[],
      level: segmentStartLevel,
    });
  }

  return {
    duration: distance / AVERAGE_WALKING_SPEED,
    distance,
    segments,
  };
};

const getIndoorOutdoorRoute = async (
  indoorFeature: Feature<Polygon>,
  indoorMap: IndoorMap,
  outdoorLocation: Location,
  mode: string
): Promise<Route | null> => {
  const entrances = GeojsonHelper.extractEntrances(indoorMap.geojson);
  if (entrances.length === 0) return null;
  const entrance: Feature<Point> = entrances[0];
  const indoorRoute = getIndoorRoute(indoorMap, indoorFeature, entrance);
  const outdoorRoute = await getRouteFromMapbox(
    entrance.geometry.coordinates,
    outdoorLocation.coordinates,
    mode
  );
  if (!indoorRoute || !outdoorRoute) return null;
  return {
    duration: indoorRoute.duration + outdoorRoute.duration,
    distance: indoorRoute.distance + outdoorRoute.distance,
    segments: [...indoorRoute.segments, ...outdoorRoute.segments],
  };
};

const getIndoorIndoorRoute = async (
  startFeature: Feature<Polygon>,
  startIndoorMap: IndoorMap,
  endFeature: Feature<Polygon>,
  endIndoorMap: IndoorMap,
  mode: string
): Promise<Route | null> => {
  const startEntrances = GeojsonHelper.extractEntrances(startIndoorMap.geojson);
  const endEntrances = GeojsonHelper.extractEntrances(endIndoorMap.geojson);

  // If either building does not have an entrance, we cannot find a route
  if (startEntrances.length === 0 || endEntrances.length === 0) return null;

  const startEntrance: Feature<Point> = startEntrances[0];
  const endEntrance: Feature<Point> = endEntrances[0];

  const startIndoorRoute = getIndoorRoute(startIndoorMap, startFeature, startEntrance);
  const endIndoorRoute = getIndoorRoute(endIndoorMap, endEntrance, endFeature);
  const outdoorRoute = await getRouteFromMapbox(
    startEntrance.geometry.coordinates,
    endEntrance.geometry.coordinates,
    mode
  );

  if (!startIndoorRoute || !endIndoorRoute || !outdoorRoute) return null;

  // Ensuring segment ids are unique
  for (const segment of startIndoorRoute.segments) {
    segment.id = `start-${segment.id}`;
  }

  return {
    duration: startIndoorRoute.duration + outdoorRoute.duration + endIndoorRoute.duration,
    distance: startIndoorRoute.distance + outdoorRoute.distance + endIndoorRoute.distance,
    segments: [...startIndoorRoute.segments, ...outdoorRoute.segments, ...endIndoorRoute.segments],
  };
};

const getRouteFromMapbox = async (
  startCoordinates: Coordinates,
  endCoordinates: Coordinates,
  mode: string
): Promise<Route | null> => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${startCoordinates[0]},${startCoordinates[1]};${endCoordinates[0]},${endCoordinates[1]}?alternatives=false&annotations=duration,distance&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${MAPBOX_ACCESS_TOKEN}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data?.routes?.length > 0) {
    const route = data.routes[0];
    return {
      duration: route.duration,
      distance: route.distance,
      segments: [
        {
          id: mode,
          type: mode === 'walking' ? 'dashed' : 'solid',
          steps: route.geometry.coordinates as Coordinates[],
        },
      ],
    };
  }
  return null;
};

const fetchLocationData = async (coordinates: Coordinates): Promise<Location> => {
  const radius = 50;
  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates[1]},${coordinates[0]}&radius=${radius}&key=${GOOGLE_API_KEY}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.results.length === 0) {
      throw new Error('No results found');
    }

    return {
      coordinates: coordinates,
      name: data.results[1]?.name || 'Selected Location',
      data: {
        address: data.results[0]?.name || 'Address not available',
        isOpen: Boolean(data.results[1].opening_hours),
      },
    };
  } catch (error) {
    console.log('Error fetching data:', error);
    return {
      name: 'Selected Location',
      coordinates: coordinates,
      data: { address: 'Location', isOpen: false },
    };
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

  const start_Walk_ShuttleStart = await getRouteFromMapbox(
    startCoordinates,
    startBusStop,
    'walking'
  );
  const shuttleStart_Drive_shuttleEnd = await getRouteFromMapbox(
    startBusStop,
    endBusStop,
    'driving'
  );
  const shuttleEnd_Walk_end = await getRouteFromMapbox(endBusStop, endCoordinates, 'walking');

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

// Simple solution to calculate distance between two (coordinate) points.
// Works for short distances, which makes it ideal for indoor navigation.
// Source: https://stackoverflow.com/a/27943
export const getDistanceFromPositions = (position1: Position, position2: Position): number => {
  const dLat = deg2rad(position2[1] - position1[1]); // deg2rad below
  const dLon = deg2rad(position2[0] - position1[0]);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(position1[1])) *
      Math.cos(deg2rad(position2[1])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = RADIUS_OF_EARTH * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
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
