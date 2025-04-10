import React, { useEffect } from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { MapProvider, useMap, MapState } from '@/modules/map/MapContext';
import { indoorMaps } from '@/modules/map/IndoorMap';
import { getRoute } from '@/modules/map/MapService';

// Mock dependencies
jest.mock('@rnmapbox/maps', () => ({
  MapView: 'MapView',
  Camera: 'Camera',
}));

jest.mock('@/modules/map/MapService', () => ({
  getRoute: jest.fn(() =>
    Promise.resolve({
      segments: [
        {
          coordinates: [
            [-73.5, 45.5],
            [-73.6, 45.6],
          ],
        },
      ],
      duration: 1000,
      distance: 2000,
    })
  ),
  getIndoorMapFromPosition: jest.fn(() => Promise.resolve(null)),
}));
jest.mock('expo-location', () => ({
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  LocationSubscription: jest.fn(),
}));
jest.mock('@/services/CoordinateService', () => ({
  getCurrentCoordinates: jest.fn(() => Promise.resolve([-74.006, 40.7128])),
  calculateRouteCoordinateBounds: jest.fn(() => ({
    ne: [-73.5, 45.6],
    sw: [-73.6, 45.5],
  })),
}));

jest.mock('@/modules/map/IndoorMap', () => ({
  indoorMaps: [
    {
      id: 'map1',
      name: 'Test Map 1',
      bounds: [-73.58, 45.49, -73.57, 45.5] as [number, number, number, number],
      levelsRange: { min: -1, max: 3 },
    },
    {
      id: 'map2',
      name: 'Test Map 2',
      bounds: [-73.59, 45.48, -73.58, 45.49] as [number, number, number, number],
      levelsRange: { min: 0, max: 2 },
    },
  ],
  IndoorMap: jest.fn(),
}));

jest.mock('@/modules/map/IndoorMapUtils', () => ({
  bboxCenter: jest.fn((bbox) => [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]),
  overlap: jest.fn(() => true),
}));

jest.mock('@turf/distance', () => jest.fn(() => 0.5));

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
      endLocation: null,
      route: null,
      indoorMap: null,
    });
  });

  test('loadRouteFromCoordinates sets route and fits bounds', async () => {
    let mapContext: ReturnType<typeof useMap> | undefined;
    const mockFitBounds = jest.fn();
    const { getRoute } = require('@/modules/map/MapService');

    render(
      <MapProvider>
        <TestComponent onMapContext={(ctx) => (mapContext = ctx)} />
      </MapProvider>
    );

    await waitFor(() => {
      expect(mapContext).toBeDefined();
    });

    if (mapContext) {
      // @ts-ignore - mocking the ref
      mapContext.cameraRef.current = {
        fitBounds: mockFitBounds,
      };
    }

    await act(async () => {
      await mapContext?.loadRouteFromCoordinates(
        [-73.57, 45.5],
        [-73.58, 45.51],
        'walking',
        'walking'
      );
    });

    expect(getRoute).toHaveBeenCalledWith([-73.57, 45.5], [-73.58, 45.51], 'walking', 'walking');

    expect(mockFitBounds).toHaveBeenCalledWith([-73.5, 45.6], [-73.6, 45.5], 50, 1500);

    expect(mapContext?.route).toEqual({
      segments: [
        {
          coordinates: [
            [-73.5, 45.5],
            [-73.6, 45.6],
          ],
        },
      ],
      duration: 1000,
      distance: 2000,
    });
  });

  test('updateSelectedMapIfNeeded updates indoor map and level', async () => {
    let mapContext: ReturnType<typeof useMap> | undefined;
    const { indoorMaps } = require('@/modules/map/IndoorMap');

    render(
      <MapProvider>
        <TestComponent onMapContext={(ctx) => (mapContext = ctx)} />
      </MapProvider>
    );

    await waitFor(() => {
      expect(mapContext).toBeDefined();
    });

    if (mapContext) {
      // @ts-ignore - mocking the map ref
      mapContext.mapRef.current = {
        getZoom: jest.fn().mockResolvedValue(18),
        getVisibleBounds: jest.fn().mockResolvedValue([
          [-73.57, 45.5],
          [-73.58, 45.49],
        ]),
      };
    }

    await act(async () => {
      mapContext?.updateSelectedMapIfNeeded();
    });

    await waitFor(() => {
      expect(mapContext?.indoorMap).toEqual(indoorMaps[0]);
      expect(mapContext?.level).toBe(indoorMaps[0].levelsRange.min);
    });
  });

  test('handles route loading error gracefully', async () => {
    let mapContext: ReturnType<typeof useMap> | undefined;
    const { getRoute } = require('@/modules/map/MapService');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    getRoute.mockRejectedValueOnce(new Error('Route not found'));

    render(
      <MapProvider>
        <TestComponent onMapContext={(ctx) => (mapContext = ctx)} />
      </MapProvider>
    );

    await waitFor(() => {
      expect(mapContext).toBeDefined();
    });

    await act(async () => {
      await mapContext?.loadRouteFromCoordinates([-73.57, 45.5], [-73.58, 45.51]);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading and setting route:',
      expect.any(Error)
    );
    expect(mapContext?.route).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  test('getClosestMap handles low zoom level', async () => {
    let mapContext: ReturnType<typeof useMap> | undefined;

    render(
      <MapProvider>
        <TestComponent onMapContext={(ctx) => (mapContext = ctx)} />
      </MapProvider>
    );

    await waitFor(() => expect(mapContext).toBeDefined());

    if (mapContext) {
      // @ts-ignore - mocking the map ref
      mapContext.mapRef.current = {
        getZoom: jest.fn().mockResolvedValue(16),
        getVisibleBounds: jest.fn().mockResolvedValue([
          [-73.57, 45.5],
          [-73.58, 45.49],
        ]),
      };
    }

    await act(async () => {
      mapContext?.updateSelectedMapIfNeeded();
    });

    // Verify early return for zoom level < 17
    expect(mapContext?.indoorMap).toBeNull();
  });

  test('getClosestMap selects single indoor map', async () => {
    let mapContext: ReturnType<typeof useMap> | undefined;

    render(
      <MapProvider>
        <TestComponent onMapContext={(ctx) => (mapContext = ctx)} />
      </MapProvider>
    );

    await waitFor(() => expect(mapContext).toBeDefined());

    if (mapContext) {
      // @ts-ignore - mocking the map ref
      mapContext.mapRef.current = {
        getZoom: jest.fn().mockResolvedValue(18),
        getVisibleBounds: jest.fn().mockResolvedValue([
          [-73.58, 45.49],
          [-73.57, 45.5], // Bounds matching exactly one indoor map
        ]),
      };
    }

    await act(async () => {
      mapContext?.updateSelectedMapIfNeeded();
    });

    await waitFor(() => {
      expect(mapContext?.indoorMap).toEqual(indoorMaps[0]);
      expect(mapContext?.level).toBe(indoorMaps[0].levelsRange.min);
    });
  });

  test('getClosestMap handles multiple overlapping maps', async () => {
    let mapContext: ReturnType<typeof useMap> | undefined;

    render(
      <MapProvider>
        <TestComponent onMapContext={(ctx) => (mapContext = ctx)} />
      </MapProvider>
    );

    await waitFor(() => expect(mapContext).toBeDefined());

    if (mapContext) {
      // @ts-ignore - mocking the map ref
      mapContext.mapRef.current = {
        getZoom: jest.fn().mockResolvedValue(18),
        getVisibleBounds: jest.fn().mockResolvedValue([
          [-73.58, 45.48],
          [-73.57, 45.51], // Bounds overlapping multiple maps
        ]),
      };
    }

    await act(async () => {
      mapContext?.updateSelectedMapIfNeeded();
    });

    await waitFor(() => {
      expect(mapContext?.indoorMap).toBeTruthy();
      expect(mapContext?.level).toBeTruthy();
    });
  });

  test('onMapPress handles indoor feature detection', async () => {
    let mapContext: ReturnType<typeof useMap> | undefined;

    render(
      <MapProvider>
        <TestComponent onMapContext={(ctx) => (mapContext = ctx)} />
      </MapProvider>
    );

    await waitFor(() => expect(mapContext).toBeDefined());

    if (mapContext) {
      mapContext.indoorMap = indoorMaps[0];
      mapContext.level = 0;
    }

    const mockEvent = {
      geometry: {
        coordinates: [-73.58, 45.49],
      },
    };

    await act(async () => {
      mapContext?.onMapPress(mockEvent);
    });

    await waitFor(() => {
      expect(mapContext?.state).toBe(MapState.Information);
      expect(mapContext?.endLocation).toBeTruthy();
    });
  });

  test('loadRouteFromCoordinates handles camera bounds fitting', async () => {
    let mapContext: ReturnType<typeof useMap> | undefined;

    render(
      <MapProvider>
        <TestComponent onMapContext={(ctx) => (mapContext = ctx)} />
      </MapProvider>
    );

    await waitFor(() => expect(mapContext).toBeDefined());

    if (mapContext) {
      // @ts-ignore - mocking the map ref
      mapContext.cameraRef.current = {
        fitBounds: jest.fn(),
      };
    }

    await act(async () => {
      await mapContext?.loadRouteFromCoordinates([-73.57, 45.5], [-73.58, 45.51]);
    });

    expect(getRoute).toHaveBeenCalledWith([-73.57, 45.5], [-73.58, 45.51], 'walking', 'walking');
    expect(mapContext?.cameraRef.current?.fitBounds).toHaveBeenCalled();
  });
});
