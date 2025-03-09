import React from 'react';
import { render, act } from '@testing-library/react-native';
import MapView from '@/modules/map/MapView';
import { MapState } from '@/modules/map/MapContext';
import { fetchLocationData } from '@/modules/map/MapService';
import PointsOfInterestService from '@/services/PointsOfInterestService';
import { getIndoorFeatureFromCoordinates } from '@/modules/map/IndoorMapUtils';

jest.mock('@rnmapbox/maps');

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

jest.mock('@/services/PointsOfInterestService', () => ({
  getAllPOIs: jest.fn(() => []),
  shouldShowPOIs: jest.fn(() => false),
  findClosestPOI: jest.fn(),
}));

jest.mock('@/modules/map/IndoorMapUtils', () => ({
  filterWithLevel: jest.fn((filter) => filter),
  getIndoorFeatureFromCoordinates: jest.fn(),
}));

const mockOnPressHandler = jest.fn();

// Create a mock for @rnmapbox/maps
jest.mock('@rnmapbox/maps', () => {
  const React = require('react');

  const MockMapView = React.forwardRef(function MockMapView(props: any, ref: any) {
    if (props.onPress) {
      mockOnPressHandler(props.onPress);
    }
    return null;
  });
  MockMapView.displayName = 'MapView';

  const MockCamera = React.forwardRef(function MockCamera(props: any, ref: any) {
    return null;
  });
  MockCamera.displayName = 'Camera';

  const MockPointAnnotation = React.forwardRef(function MockPointAnnotation(props: any, ref: any) {
    return null;
  });
  MockPointAnnotation.displayName = 'PointAnnotation';

  const MockMarkerView = React.forwardRef(function MockMarkerView(props: any, ref: any) {
    return null;
  });
  MockMarkerView.displayName = 'MarkerView';

  const MockShapeSource = React.forwardRef(function MockShapeSource(props: any, ref: any) {
    return null;
  });
  MockShapeSource.displayName = 'ShapeSource';

  const MockLineLayer = React.forwardRef(function MockLineLayer(props: any, ref: any) {
    return null;
  });
  MockLineLayer.displayName = 'LineLayer';

  const MockFillLayer = React.forwardRef(function MockFillLayer(props: any, ref: any) {
    return null;
  });
  MockFillLayer.displayName = 'FillLayer';

  const MockSymbolLayer = React.forwardRef(function MockSymbolLayer(props: any, ref: any) {
    return null;
  });
  MockSymbolLayer.displayName = 'SymbolLayer';

  const MockCallout = React.forwardRef(function MockCallout(props: any, ref: any) {
    return null;
  });
  MockCallout.displayName = 'Callout';

  return {
    setAccessToken: jest.fn(),
    MapView: MockMapView,
    Camera: MockCamera,
    PointAnnotation: MockPointAnnotation,
    MarkerView: MockMarkerView,
    ShapeSource: MockShapeSource,
    LineLayer: MockLineLayer,
    FillLayer: MockFillLayer,
    SymbolLayer: MockSymbolLayer,
    Callout: MockCallout,
  };
});

const mockMarkerPressHandlers: Record<string, Function> = {};

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
  const mockIndoorMap = {
    id: 'test-indoor',
    name: 'Test Indoor Map',
    geojson: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { level: 0, room: 'lobby' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
              ],
            ],
          },
        },
      ],
    },
  };
  const mockSetState = jest.fn();
  const mockSetStartLocation = jest.fn();
  const mockSetEndLocation = jest.fn();
  const mockUpdateSelectedMapIfNeeded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockMarkerPressHandlers).forEach((key) => delete mockMarkerPressHandlers[key]);

    // Mock useMap hook with default values
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValue({
      state: MapState.Idle,
      setState: mockSetState,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
      userLocation: null,
      setStartLocation: mockSetStartLocation,
      setEndLocation: mockSetEndLocation,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: mockRoute,
      level: null,
      indoorMap: null,
      updateSelectedMapIfNeeded: mockUpdateSelectedMapIfNeeded,
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
      expect.objectContaining({ address: 'Test Address', isOpen: true, name: 'Test Location' })
    );
    expect(mockSetState).toHaveBeenCalledWith(MapState.Information);
    expect(mockCameraRef.current.flyTo).toHaveBeenCalledWith([2, 2], 1000);
  });

  it('handles map click in SelectingStartLocation state', async () => {
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValueOnce({
      state: MapState.SelectingStartLocation,
      setState: mockSetState,
      startLocation: null,
      endLocation: mockEndLocation,
      userLocation: null,
      setStartLocation: mockSetStartLocation,
      setEndLocation: mockSetEndLocation,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: null,
      level: null,
      indoorMap: null,
      updateSelectedMapIfNeeded: mockUpdateSelectedMapIfNeeded,
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
      expect.objectContaining({ address: 'Test Address', isOpen: true, name: 'Test Location' })
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
      userLocation: null,
      setStartLocation: mockSetStartLocation,
      setEndLocation: mockSetEndLocation,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: null,
      level: null,
      indoorMap: null,
      updateSelectedMapIfNeeded: mockUpdateSelectedMapIfNeeded,
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
      expect.objectContaining({ address: 'Test Address', isOpen: true, name: 'Test Location' })
    );
    expect(mockSetState).toHaveBeenCalledWith(MapState.RoutePlanning);
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

  it('handles indoor map click and uses indoor location', async () => {
    const { useMap } = require('@/modules/map/MapContext');
    const mockIndoorLocation = {
      name: 'Indoor Room',
      coordinates: [0.5, 0.5],
      data: {
        address: 'Indoor Address',
        isOpen: true,
      },
    };

    (getIndoorFeatureFromCoordinates as jest.Mock).mockReturnValue(mockIndoorLocation);

    useMap.mockReturnValueOnce({
      state: MapState.Idle,
      setState: mockSetState,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
      userLocation: null,
      setStartLocation: mockSetStartLocation,
      setEndLocation: mockSetEndLocation,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 15,
      pitchLevel: 0,
      route: mockRoute,
      level: 0,
      indoorMap: mockIndoorMap,
      updateSelectedMapIfNeeded: mockUpdateSelectedMapIfNeeded,
    });

    render(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: {
          coordinates: [0.5, 0.5],
        },
      });
    });

    expect(getIndoorFeatureFromCoordinates).toHaveBeenCalledWith(mockIndoorMap, [0.5, 0.5], 0);
    expect(mockSetEndLocation).toHaveBeenCalledWith(mockIndoorLocation);
    expect(mockSetState).toHaveBeenCalledWith(MapState.Information);
  });

  it('handles POI click and uses POI location', async () => {
    const { useMap } = require('@/modules/map/MapContext');
    const mockPOI = {
      id: 'poi1',
      name: 'Test POI',
      coordinates: [3, 3],
      address: 'POI Address',
      type: 'restaurant',
      openingHours: {
        isOpen: true,
        hours: '9AM-5PM',
      },
      description: 'A nice place',
    };

    (PointsOfInterestService.findClosestPOI as jest.Mock).mockReturnValue(mockPOI);

    useMap.mockReturnValueOnce({
      state: MapState.Idle,
      setState: mockSetState,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
      userLocation: null,
      setStartLocation: mockSetStartLocation,
      setEndLocation: mockSetEndLocation,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 15,
      pitchLevel: 0,
      route: mockRoute,
      level: null,
      indoorMap: null,
      updateSelectedMapIfNeeded: mockUpdateSelectedMapIfNeeded,
    });

    render(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: {
          coordinates: [3, 3],
        },
      });
    });

    expect(PointsOfInterestService.findClosestPOI).toHaveBeenCalledWith([3, 3]);
    expect(mockSetEndLocation).toHaveBeenCalledWith({
      name: 'Test POI',
      coordinates: [3, 3],
      data: {
        address: 'POI Address',
        isOpen: true,
        hours: '9AM-5PM',
        description: 'A nice place',
      },
    });
    expect(mockSetState).toHaveBeenCalledWith(MapState.Information);
  });
});
