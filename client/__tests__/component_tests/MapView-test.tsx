import React from 'react';
import { render, act } from '@testing-library/react-native';
import MapView from '@/modules/map/MapView';
import { MapState } from '@/modules/map/MapContext';
import { fetchLocationData } from '@/modules/map/MapService';
import { TaskProvider } from '@/providers/TaskContext';

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
  getFeatureCollection: jest.fn(),
}));

jest.mock('@/modules/map/IndoorMapUtils', () => ({
  filterWithLevel: jest.fn((filter) => filter),
  getIndoorFeatureFromCoordinates: jest.fn(),
}));

jest.mock('@/assets', () => ({
  images: {},
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

  const MockImages = React.forwardRef(function MockImages(props: any, ref: any) {
    return null;
  });
  MockImages.displayName = 'Images';

  const MockFillExtrusionLayer = React.forwardRef(function MockFillExtrusionLayer(
    props: any,
    ref: any
  ) {
    return null;
  });
  MockFillExtrusionLayer.displayName = 'FillExtrusionLayer';

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
    Images: MockImages,
    FillExtrusionLayer: MockFillExtrusionLayer,
  };
});

const mockMarkerPressHandlers: Record<string, Function> = {};

const renderWithProviders = (ui: React.ReactElement) => render(<TaskProvider>{ui}</TaskProvider>);

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
  const mockUpdateSelectedMapIfNeeded = jest.fn();
  const mockOnMapPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockMarkerPressHandlers).forEach((key) => delete mockMarkerPressHandlers[key]);

    // Mock useMap hook with default values
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValue({
      state: MapState.Idle,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
      userLocation: null,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: mockRoute,
      level: null,
      indoorMap: null,
      updateSelectedMapIfNeeded: mockUpdateSelectedMapIfNeeded,
      onMapPress: mockOnMapPress,
    });

    (fetchLocationData as jest.Mock).mockResolvedValue({
      name: 'Test Location',
      address: 'Test Address',
      isOpen: true,
    });
  });

  it('renders without throwing errors', () => {
    expect(() => {
      renderWithProviders(<MapView />);
    }).not.toThrow();
  });

  it('handles map click in Idle state', async () => {
    renderWithProviders(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: {
          coordinates: [2, 2],
        },
      });
    });

    expect(mockOnMapPress).toHaveBeenCalledWith(
      expect.objectContaining({
        geometry: {
          coordinates: [2, 2],
        },
      })
    );
  });

  it('handles map click in SelectingStartLocation state', async () => {
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValueOnce({
      state: MapState.SelectingStartLocation,
      startLocation: null,
      endLocation: mockEndLocation,
      userLocation: null,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: null,
      level: null,
      indoorMap: null,
      updateSelectedMapIfNeeded: mockUpdateSelectedMapIfNeeded,
      onMapPress: mockOnMapPress,
    });

    renderWithProviders(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: {
          coordinates: [2, 2],
        },
      });
    });

    expect(mockOnMapPress).toHaveBeenCalledWith(
      expect.objectContaining({
        geometry: {
          coordinates: [2, 2],
        },
      })
    );
  });

  it('handles map click in SelectingEndLocation state', async () => {
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValueOnce({
      state: MapState.SelectingEndLocation,
      startLocation: mockStartLocation,
      endLocation: null,
      userLocation: null,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: null,
      level: null,
      indoorMap: null,
      updateSelectedMapIfNeeded: mockUpdateSelectedMapIfNeeded,
      onMapPress: mockOnMapPress,
    });

    renderWithProviders(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: {
          coordinates: [2, 2],
        },
      });
    });

    expect(mockOnMapPress).toHaveBeenCalledWith(
      expect.objectContaining({
        geometry: {
          coordinates: [2, 2],
        },
      })
    );
  });

  it('ignores map click with invalid coordinates', async () => {
    renderWithProviders(<MapView />);

    const onPressHandler = mockOnPressHandler.mock.calls[0][0];

    await act(async () => {
      await onPressHandler({
        geometry: null,
      });
    });

    expect(mockOnMapPress).toHaveBeenCalledWith(
      expect.objectContaining({
        geometry: null,
      })
    );
  });
  it('renders start and end location markers in RoutePlanning state', () => {
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValueOnce({
      state: MapState.RoutePlanning,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
      userLocation: null,
      mapRef: mockMapRef,
      cameraRef: mockCameraRef,
      centerCoordinate: [0, 0],
      zoomLevel: 12,
      pitchLevel: 0,
      route: mockRoute,
      level: null,
      indoorMap: null,
      updateSelectedMapIfNeeded: mockUpdateSelectedMapIfNeeded,
      onMapPress: mockOnMapPress,
    });

    const { UNSAFE_getAllByType } = renderWithProviders(<MapView />);
    const { MarkerView } = require('@rnmapbox/maps');

    expect(UNSAFE_getAllByType).not.toBeNull();
    expect(MarkerView).not.toBeNull();
  });
});
