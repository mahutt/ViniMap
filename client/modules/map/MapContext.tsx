import React, { createContext, useContext, useRef, useState, useMemo } from 'react';
import Mapbox from '@rnmapbox/maps';

// downtown concordia campus (sgw)
const DEFAULT_COORDINATES: [number, number] = [-73.5789, 45.4973];

type MapContextType = {
  mapRef: React.RefObject<Mapbox.MapView>;
  cameraRef: React.RefObject<Mapbox.Camera>;
  centerCoordinate: [number, number];
  zoomLevel: number;
  setCenterCoordinate: (centerCoordinate: [number, number]) => void;
  setZoomLevel: (zoomLevel: number) => void;
  flyTo: (coords: [number, number], zoomLevel?: number) => void;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mapRef = useRef<Mapbox.MapView | null>(null);
  const cameraRef = useRef<Mapbox.Camera | null>(null);
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>(DEFAULT_COORDINATES);
  const [zoomLevel, setZoomLevel] = useState(15);

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

  const value = useMemo(
    () => ({
      mapRef,
      cameraRef,
      centerCoordinate,
      zoomLevel,
      setCenterCoordinate,
      setZoomLevel,
      flyTo,
    }),
    [centerCoordinate, zoomLevel, flyTo]
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
