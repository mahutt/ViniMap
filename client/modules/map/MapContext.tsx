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
import { getRoute } from './MapService';
import { Coordinates, Route } from './Types';
import { LocationSubscription, watchPositionAsync } from 'expo-location';
import CoordinateService from '@/services/CoordinateService';

export interface Location {
  name: string | null;
  coordinates: Coordinates;
  data?: any;
}

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
  centerCoordinate: [number, number];
  zoomLevel: number;

  pitchLevel: number;
  setPitchLevel: (pitchLevel: number) => void;

  state: MapState;
  startLocation: Location | null;
  endLocation: Location | null;
  userLocation: Location | null;
  route: Route | null;
  setCenterCoordinate: (centerCoordinate: [number, number]) => void;
  setZoomLevel: (zoomLevel: number) => void;
  setState: (state: MapState) => void;
  setStartLocation: (startLocation: Location | null) => void;
  setEndLocation: (endLocation: Location | null) => void;
  flyTo: (coords: [number, number], zoomLevel?: number) => void;
  loadRouteFromCoordinates: (
    startCoordinates: Coordinates,
    endCoordinates: Coordinates,
    mode?: string
  ) => Promise<void>;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mapRef = useRef<Mapbox.MapView | null>(null);
  const cameraRef = useRef<Mapbox.Camera | null>(null);
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>(DEFAULT_COORDINATES);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [pitchLevel, setPitchLevel] = useState(0);
  const [state, setState] = useState<MapState>(MapState.Idle);

  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [route, setRoute] = useState<Route | null>(null);

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
    () => (newCenterCoordinate: [number, number], newZoomLevel?: number) => {
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
    async (
      startCoordinates: Coordinates,
      endCoordinates: Coordinates,
      mode = 'walking'
    ): Promise<void> => {
      if (!startCoordinates || !endCoordinates) {
        return;
      }

      return getRoute(startCoordinates, endCoordinates, mode)
        .then((route) => {
          if (route) {
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
          }
        })
        .catch((error) => {
          console.error('Error setting route:', error);
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
      pitchLevel,
      setPitchLevel,
      state,
      startLocation,
      endLocation,
      userLocation,
      route,
      setCenterCoordinate,
      setZoomLevel,
      setState,
      setStartLocation,
      setEndLocation,
      flyTo,
      loadRouteFromCoordinates,
    }),
    [
      centerCoordinate,
      zoomLevel,
      state,
      startLocation,
      endLocation,
      userLocation,
      route,
      flyTo,
      pitchLevel,
      loadRouteFromCoordinates,
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
