import React, { createContext, useContext, useRef, useState, useMemo } from 'react';
import Mapbox from '@rnmapbox/maps';
import { getLocationCoordinates, getRoute } from './MapService';

export type Coordinates = [number, number];
export interface Location {
  name: string | null;
  coordinates: Coordinates;
}

export enum MapState {
  Idle,
  RoutePlanning,
}

// downtown concordia campus (sgw)
const DEFAULT_COORDINATES: Coordinates = [-73.5789, 45.4973];

type MapContextType = {
  mapRef: React.RefObject<Mapbox.MapView>;
  cameraRef: React.RefObject<Mapbox.Camera>;
  centerCoordinate: [number, number];
  zoomLevel: number;
  state: MapState;
  startLocation: Location | null;
  endLocation: Location | null;
  routeCoordinates: Coordinates[];
  mode: string;
  duration: number | null;
  distance: number | null;
  setCenterCoordinate: (centerCoordinate: [number, number]) => void;
  setZoomLevel: (zoomLevel: number) => void;
  setState: (state: MapState) => void;
  setMode: (mode: string) => void;
  flyTo: (coords: [number, number], zoomLevel?: number) => void;
  loadRoute: (
    startLocationQuery: string,
    endLocationQuery: string,
    mode: string
  ) => Promise<{ duration: number; distance: number } | void>;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mapRef = useRef<Mapbox.MapView | null>(null);
  const cameraRef = useRef<Mapbox.Camera | null>(null);
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>(DEFAULT_COORDINATES);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [state, setState] = useState<MapState>(MapState.RoutePlanning);
  const [mode, setMode] = useState<string>('walking');

  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const flyTo = useMemo(
    () => (newCenterCoordinate: [number, number], newZoomLevel?: number) => {
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: newCenterCoordinate,
          zoomLevel: newZoomLevel ?? zoomLevel,
          animationDuration: 2000,
        });
        setCenterCoordinate(newCenterCoordinate);
        if (newZoomLevel) setZoomLevel(newZoomLevel);
      }
    },
    [zoomLevel]
  );

  const loadRoute = async (
    startLocationQuery: string,
    endLocationQuery: string,
    mode: string
  ): Promise<{ duration: number; distance: number } | void> => {
    try {
      const [newStartLocation, newEndLocation] = await Promise.all([
        getLocationCoordinates(startLocationQuery),
        getLocationCoordinates(endLocationQuery),
      ]);

      if (newStartLocation && newEndLocation) {
        setStartLocation(newStartLocation);
        setEndLocation(newEndLocation);

        try {
          const { coordinates, duration, distance } = await getRoute(
            newStartLocation.coordinates,
            newEndLocation.coordinates,
            mode
          );
          if (coordinates) {
            setRouteCoordinates(coordinates);
            setDuration(duration);
            setDistance(distance);
            if (coordinates.length > 0) {
              flyTo(coordinates[0], zoomLevel);
            }
            return { duration: duration ?? 0, distance: distance ?? 0 };
          } else {
            console.error('No route found between the specified locations.');
          }
        } catch (routeError) {
          console.error('Error fetching route coordinates:', routeError);
        }
      }
    } catch (locationError) {
      console.error('Error fetching location coordinates:', locationError);
    }
  };

  const value = useMemo(
    () => ({
      mapRef,
      cameraRef,
      centerCoordinate,
      zoomLevel,
      state,
      startLocation,
      endLocation,
      routeCoordinates,
      mode,
      duration: duration ?? 0,
      distance: distance ?? 0,
      setCenterCoordinate,
      setZoomLevel,
      setState,
      setMode,
      flyTo,
      loadRoute,
    }),
    [
      centerCoordinate,
      zoomLevel,
      state,
      startLocation,
      endLocation,
      routeCoordinates,
      flyTo,
      mode,
      duration,
      distance,
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
