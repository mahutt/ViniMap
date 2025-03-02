import React from 'react';
import { render, act } from '@testing-library/react-native';
import MapView from '@/modules/map/MapView';
import { MapState } from '@/modules/map/MapContext';
import { fetchLocationData } from '@/modules/map/MapService';

// Mock dependencies
jest.mock('@/modules/map/MapContext', () => ({
  MapState: {
    Idle: 'IDLE',
    SelectingStartLocation: 'SELECTING_START_LOCATION',
    SelectingEndLocation: 'SELECTING_END_LOCATION',
    RoutePlanning: 'ROUTE_PLANNING',
    Information: 'INFORMATION',
    Navigating: 'NAVIGATING',
  },
  useMap: jest.fn(),
}));

jest.mock('@/modules/map/MapService', () => ({
  fetchLocationData: jest.fn(),
}));

// Create a mock for @rnmapbox/maps
const mockOnPressHandler = jest.fn();

jest.mock('@rnmapbox/maps', () => {
  const React = require('react');

  return {
    setAccessToken: jest.fn(),
    MapView: React.forwardRef(({ onPress, children, ...rest }: any, ref: any) => {
      if (onPress) {
        mockOnPressHandler(onPress);
      }
      return null;
    }),
    Camera: React.forwardRef((_: any, __: any) => null),
    PointAnnotation: React.forwardRef((_: any, __: any) => null),
    MarkerView: React.forwardRef((_: any, __: any) => null),
    ShapeSource: React.forwardRef((_: any, __: any) => null),
    LineLayer: React.forwardRef((_: any, __: any) => null),
    Callout: React.forwardRef((_: any, __: any) => null),
  };
});

describe('MapView', () => {
  const mockMapRef = { current: {} };
  const mockCameraRef = { current: { flyTo: jest.fn() } };
  const mockStartLocation = {
    name: 'Start',
    coordinates: [0, 0],
  };
  const mockEndLocation = {
    name: 'End',
    coordinates: [1, 1],
    data: { address: 'End address', isOpen: true },
  };
  const mockRoute = {
    segments: [
      {
        id: 'segment1',
        type: 'normal',
        steps: [
          [0, 0],
          [0.5, 0.5],
          [1, 1],
        ],
      },
      {
        id: 'segment2',
        type: 'dashed',
        steps: [
          [1, 1],
          [1.5, 1.5],
          [2, 2],
        ],
      },
    ],
  };
  const mockSetState = jest.fn();
  const mockSetStartLocation = jest.fn();
  const mockSetEndLocation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useMap hook with default values
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValue({
      state: MapState.Idle,
      setState: mockSetState,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
      setStartLocation: mockSetStartLocation,
      setEndLocation: mockSetEndLocation,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: mockRoute,
    });

    (fetchLocationData as jest.Mock).mockResolvedValue({
      name: 'Test Location',
      address: 'Test Address',
      isOpen: true,
    });
  });

  it('renders without throwing errors', () => {
    expect(() => {
      render(<MapView />);
    }).not.toThrow();
  });

  it('handles map click in Idle state', async () => {
    render(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: {
          coordinates: [2, 2],
        },
      });
    });

    expect(mockSetEndLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Location',
        coordinates: [2, 2],
      })
    );
    expect(mockSetState).toHaveBeenCalledWith(MapState.Information);
    expect(mockCameraRef.current.flyTo).toHaveBeenCalledWith([2, 2], 17);
  });

  it('handles map click in SelectingStartLocation state', async () => {
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValueOnce({
      state: MapState.SelectingStartLocation,
      setState: mockSetState,
      startLocation: null,
      endLocation: mockEndLocation,
      setStartLocation: mockSetStartLocation,
      setEndLocation: mockSetEndLocation,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: null,
    });

    render(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: {
          coordinates: [2, 2],
        },
      });
    });

    expect(mockSetStartLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Location',
        coordinates: [2, 2],
      })
    );
    expect(mockSetState).toHaveBeenCalledWith(MapState.RoutePlanning);
  });

  it('handles map click in SelectingEndLocation state', async () => {
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValueOnce({
      state: MapState.SelectingEndLocation,
      setState: mockSetState,
      startLocation: mockStartLocation,
      endLocation: null,
      setStartLocation: mockSetStartLocation,
      setEndLocation: mockSetEndLocation,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: null,
    });

    render(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: {
          coordinates: [2, 2],
        },
      });
    });

    expect(mockSetEndLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Location',
        coordinates: [2, 2],
      })
    );
    expect(mockSetState).toHaveBeenCalledWith(MapState.RoutePlanning);
  });

  it('handles error when fetching location data', async () => {
    (fetchLocationData as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValueOnce({
      state: MapState.SelectingEndLocation,
      setState: mockSetState,
      startLocation: mockStartLocation,
      endLocation: null,
      setStartLocation: mockSetStartLocation,
      setEndLocation: mockSetEndLocation,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: null,
    });

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: {
          coordinates: [2, 2],
        },
      });
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('Error fetching location data:', expect.any(Error));
    expect(mockSetEndLocation).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Selected Location',
        coordinates: [2, 2],
      })
    );
    expect(mockSetState).toHaveBeenCalledWith(MapState.Information);

    consoleWarnSpy.mockRestore();
  });

  it('handles error when fetching location data in SelectingStartLocation state', async () => {
    (fetchLocationData as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValueOnce({
      state: MapState.SelectingStartLocation,
      setState: mockSetState,
      startLocation: null,
      endLocation: null,
      setStartLocation: mockSetStartLocation,
      setEndLocation: mockSetEndLocation,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: null,
    });

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: {
          coordinates: [2, 2],
        },
      });
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('Error fetching location data:', expect.any(Error));
    expect(mockSetStartLocation).toHaveBeenCalledWith({
      name: null,
      coordinates: [2, 2],
    });

    consoleWarnSpy.mockRestore();
  });

  it('ignores map click with invalid coordinates', async () => {
    render(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: null,
      });
    });

    expect(mockSetStartLocation).not.toHaveBeenCalled();
    expect(mockSetEndLocation).not.toHaveBeenCalled();
    expect(mockSetState).not.toHaveBeenCalled();
  });
});
