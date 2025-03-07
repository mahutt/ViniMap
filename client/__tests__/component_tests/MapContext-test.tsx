import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { MapProvider, useMap, MapState } from '@/modules/map/MapContext';

// Mock dependencies
jest.mock('@/modules/map/MapService', () => ({ getRoute: jest.fn() }));
jest.mock('expo-location', () => ({
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
}));
jest.mock('@/services/CoordinateService', () => ({
  getCurrentCoordinates: jest.fn(() => Promise.resolve([-74.006, 40.7128])),
  calculateRouteCoordinateBounds: jest.fn(),
}));

const TestComponent: React.FC<{ onMapContext?: (ctx: ReturnType<typeof useMap>) => void }> = ({
  onMapContext,
}) => {
  const mapContext = useMap();
  useEffect(() => {
    onMapContext?.(mapContext);
  }, [mapContext, onMapContext]);
  return null;
};

describe('MapContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with default values', async () => {
    let mapContext: ReturnType<typeof useMap> | undefined;

    await waitFor(() =>
      render(
        <MapProvider>
          <TestComponent onMapContext={(ctx) => (mapContext = ctx)} />
        </MapProvider>
      )
    );

    expect(mapContext).toMatchObject({
      centerCoordinate: [-73.5789, 45.4973],
      zoomLevel: 15,
      state: MapState.Idle,
      startLocation: null,
    });
  });
});
