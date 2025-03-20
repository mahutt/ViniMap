import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import Mapbox from '@rnmapbox/maps';
import { fetchLocationData, getRoute } from './MapService';
import { Location, Coordinates, Route, Level, IndoorMap } from './Types';
import { indoorMaps } from './IndoorMap';
import type { BBox, Position } from 'geojson';
import { bboxCenter, getIndoorFeatureFromCoordinates, overlap } from './IndoorMapUtils';
import { default as turfDistance } from '@turf/distance';
import { LocationSubscription, watchPositionAsync } from 'expo-location';
import CoordinateService from '@/services/CoordinateService';
import PointsOfInterestService from '@/services/PointsOfInterestService';
import { Alert } from 'react-native';

export enum MapState {
  Idle,
  RoutePlanning,
  Information,
  SelectingStartLocation,
  SelectingEndLocation,
}

const DEFAULT_COORDINATES: Coordinates = [-73.5789, 45.4973];

type MapContextType = {
  mapRef: React.RefObject<Mapbox.MapView>;
  cameraRef: React.RefObject<Mapbox.Camera>;
  centerCoordinate: Position;
  zoomLevel: number;
  level: Level | null;

  pitchLevel: number;
  setPitchLevel: (pitchLevel: number) => void;

  state: MapState;
  startLocation: Location | null;
  endLocation: Location | null;
  userLocation: Location | null;
  route: Route | null;
  setRoute: (route: Route | null) => void;
  setCenterCoordinate: (centerCoordinate: Position) => void;
  setZoomLevel: (zoomLevel: number) => void;
  setLevel: (level: Level | null) => void;
  setState: (state: MapState) => void;
  setStartLocation: (startLocation: Location | null) => void;
  setEndLocation: (endLocation: Location | null) => void;
  flyTo: (coords: Position, zoomLevel?: number) => void;
  loadRouteFromCoordinates: (
    startLocation: Location,
    endLocation: Location,
    mode?: string
  ) => Promise<void>;

  indoorMap: IndoorMap | null;
  updateSelectedMapIfNeeded: () => void;
  onMapPress: (event: any) => void;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mapRef = useRef<Mapbox.MapView | null>(null);
  const cameraRef = useRef<Mapbox.Camera | null>(null);
  const [centerCoordinate, setCenterCoordinate] = useState<Position>(DEFAULT_COORDINATES);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [level, setLevel] = useState<Level | null>(-1);
  const [pitchLevel, setPitchLevel] = useState(0);
  const [state, setState] = useState<MapState>(MapState.Idle);

  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [route, setRoute] = useState<Route | null>(null);

  const [indoorMap, setIndoorMap] = useState<IndoorMap | null>(null);
  const mapLoadedPromise = useRef<Promise<void>>(Promise.resolve());
  const updateMapPromise = useRef<Promise<void>>(Promise.resolve());

  const getClosestMap = async (): Promise<IndoorMap | null> => {
    const [currentZoomLevel, cameraBounds] = await Promise.all([
      mapRef.current?.getZoom(),
      mapRef.current?.getVisibleBounds(),
    ]);

    if (!currentZoomLevel || currentZoomLevel < 17 || !cameraBounds) {
      return null;
    }

    // [west, south, east, north]
    const cameraBoundsTurf = [
      cameraBounds[1][0],
      cameraBounds[1][1],
      cameraBounds[0][0],
      cameraBounds[0][1],
    ] as BBox;

    const mapsInBounds = indoorMaps.filter((indoorMap) =>
      overlap(indoorMap.bounds, cameraBoundsTurf)
    );

    if (mapsInBounds.length === 0) {
      return null;
    }

    if (mapsInBounds.length === 1) {
      return mapsInBounds[0];
    }

    let minDist = Number.POSITIVE_INFINITY;
    let closestMap = mapsInBounds[0];
    for (const map of mapsInBounds) {
      const _dist = turfDistance(bboxCenter(map.bounds), bboxCenter(cameraBoundsTurf));
      if (_dist < minDist) {
        closestMap = map;
        minDist = _dist;
      }
    }
    return closestMap;
  };

  const updateSelectedMapIfNeeded = useMemo(() => {
    return async () => {
      await mapLoadedPromise.current;
      await updateMapPromise.current;
      updateMapPromise.current = (async () => {
        const closestMap = await getClosestMap();
        if ((closestMap === null) !== (indoorMap === null) || closestMap?.id !== indoorMap?.id) {
          setIndoorMap(closestMap);
          setLevel(closestMap?.levelsRange.min ?? null);
        }
      })();
    };
  }, [indoorMap, setIndoorMap, setLevel]);

  const getLocationFromCoordinates = useCallback(
    async (coordinates: Coordinates): Promise<Location> => {
      if (indoorMap !== null && level !== null) {
        const location = getIndoorFeatureFromCoordinates(indoorMap, coordinates, level);
        if (location) {
          return location;
        }
      }

      for (let indoorMap of indoorMaps) {
        if (
          overlap(indoorMap.bounds, [
            coordinates[0],
            coordinates[1],
            coordinates[0],
            coordinates[1],
          ])
        ) {
          return {
            coordinates,
            name: indoorMap.id,
            data: { address: indoorMap.id, isOpen: false },
          };
        }
      }

      const clickedPOI = PointsOfInterestService.findClosestPOI(coordinates);
      if (clickedPOI) {
        return {
          name: clickedPOI.name,
          coordinates: clickedPOI.coordinates,
          data: {
            address: clickedPOI.address,
            isOpen: clickedPOI.openingHours.isOpen,
            hours: clickedPOI.openingHours.hours,
            description: clickedPOI.description ?? '',
          },
        };
      }

      return await fetchLocationData(coordinates);
    },
    [indoorMap, level]
  );

  const onMapPress = useCallback(
    async (event: any) => {
      const { geometry } = event;

      if (!geometry?.coordinates) {
        return;
      }

      const coordinates = geometry.coordinates;

      let location: Location = await getLocationFromCoordinates(coordinates);

      switch (state) {
        case MapState.SelectingStartLocation:
          setStartLocation(location);
          if (endLocation) {
            setRoute(null); // Clear route if start location is changed
            setState(MapState.RoutePlanning);
          }
          break;

        case MapState.SelectingEndLocation:
          setEndLocation(location);
          setRoute(null); // Clear route if end location is changed
          setState(MapState.RoutePlanning);
          break;

        default:
          setEndLocation(location);
          setState(MapState.Information);
          break;
      }

      if (cameraRef.current) {
        cameraRef.current.flyTo(coordinates, 1000);
      }
    },
    [state, endLocation, getLocationFromCoordinates]
  );

  useEffect(() => {
    let subscription: LocationSubscription;
    CoordinateService.getCurrentCoordinates().then((coords) => {
      setUserLocation({
        name: 'Current location',
        coordinates: coords,
      });
    });
    (async () => {
      subscription = await watchPositionAsync(
        { timeInterval: 5000, distanceInterval: 5 },
        (location) =>
          setUserLocation({
            name: 'Current location',
            coordinates: [location.coords.longitude, location.coords.latitude],
          })
      );
    })();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const flyTo = useMemo(
    () => (newCenterCoordinate: Position, newZoomLevel?: number) => {
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: newCenterCoordinate,
          zoomLevel: newZoomLevel ?? zoomLevel,
          animationDuration: 2000,
          pitch: pitchLevel,
        });
        setCenterCoordinate(newCenterCoordinate);
        if (newZoomLevel) setZoomLevel(newZoomLevel);
      }
    },
    [zoomLevel, pitchLevel]
  );

  const loadRouteFromCoordinates = useCallback(
    async (startLocation: Location, endLocation: Location, mode = 'walking'): Promise<void> => {
      return getRoute(startLocation, endLocation, mode)
        .then((route) => {
          if (route === null) {
            Alert.alert('No route found', "These locations aren't currently supported.");
            return;
          }

          if (route.segments.length > 0 && cameraRef.current) {
            const bounds = CoordinateService.calculateRouteCoordinateBounds(route);
            cameraRef.current.fitBounds(
              bounds.ne,
              bounds.sw,
              50, // padding
              1500 // animation duration
            );
          }
          setRoute(route);
        })
        .catch((error) => {
          console.error('Error loading and setting route:', error);
        });
    },
    []
  );

  const value = useMemo(
    () => ({
      mapRef,
      cameraRef,
      centerCoordinate,
      zoomLevel,
      level,
      pitchLevel,
      setPitchLevel,
      state,
      startLocation,
      endLocation,
      userLocation,
      route,
      setRoute,
      setCenterCoordinate,
      setZoomLevel,
      setLevel,
      setState,
      setStartLocation,
      setEndLocation,
      flyTo,
      loadRouteFromCoordinates,
      indoorMap,
      updateSelectedMapIfNeeded,
      onMapPress,
    }),
    [
      centerCoordinate,
      zoomLevel,
      level,
      state,
      startLocation,
      endLocation,
      userLocation,
      route,
      flyTo,
      pitchLevel,
      loadRouteFromCoordinates,
      indoorMap,
      updateSelectedMapIfNeeded,
      onMapPress,
    ]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
export { Coordinates };
