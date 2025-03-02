import React from 'react';
import { render, act } from '@testing-library/react-native';
import RoutePlanner from '@/components/RoutePlanner';
import { MapState } from '@/modules/map/MapContext';
import { getRoute } from '@/modules/map/MapService';
import { getCurrentLocationAsStart } from '@/modules/map/LocationHelper';

// Mock the MapContext module
jest.mock('@/modules/map/MapContext', () => ({
  MapState: {
    RoutePlanning: 'ROUTE_PLANNING',
    Navigating: 'NAVIGATING',
    Idle: 'IDLE',
  },
  useMap: jest.fn(),
}));

// Mock the required modules
jest.mock('@/modules/map/MapService', () => ({
  getRoute: jest.fn(),
}));

jest.mock('@/modules/map/LocationHelper', () => ({
  getCurrentLocationAsStart: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock components
jest.mock('@/components/ui/RoutePlanner Components/TransportModes', () => 'TransportModes');
jest.mock('@/components/ui/RoutePlanner Components/BottomFrame', () => 'BottomFrame');
jest.mock('@/components/ui/RoutePlanner Components/InputFields', () => 'InputFields');

describe('RoutePlanner', () => {
  const mockStartLocation = {
    coordinates: [51.5074, -0.1278],
    name: 'London',
  };

  const mockEndLocation = {
    coordinates: [48.8566, 2.3522],
    name: 'Paris',
  };

  const mockLoadRouteFromCoordinates = jest.fn();
  const mockSetStartLocation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValue({
      state: MapState.RoutePlanning,
      startLocation: mockStartLocation,
      endLocation: mockEndLocation,
      setStartLocation: mockSetStartLocation,
      loadRouteFromCoordinates: mockLoadRouteFromCoordinates,
    });

    (getRoute as jest.Mock).mockImplementation((start, end, mode) => {
      if (mode === 'shuttle') {
        return Promise.resolve(null);
      }

      return Promise.resolve({
        duration: mode === 'walking' ? 120 : mode === 'cycling' ? 60 : 30,
        distance: mode === 'walking' ? 5000 : mode === 'cycling' ? 3000 : 1500,
      });
    });

    (getCurrentLocationAsStart as jest.Mock).mockImplementation((callback) => {
      callback(mockStartLocation);
      return Promise.resolve();
    });
  });

  it('renders correctly in route planning mode', async () => {
    const { toJSON } = render(<RoutePlanner />);

    expect(toJSON()).toBeTruthy();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockLoadRouteFromCoordinates).toHaveBeenCalledWith(
      mockStartLocation.coordinates,
      mockEndLocation.coordinates,
      'walking'
    );
  });

  it('fetches current location when start location is not provided', async () => {
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValueOnce({
      state: MapState.RoutePlanning,
      startLocation: null,
      endLocation: mockEndLocation,
      setStartLocation: mockSetStartLocation,
      loadRouteFromCoordinates: mockLoadRouteFromCoordinates,
    });

    render(<RoutePlanner />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(getCurrentLocationAsStart).toHaveBeenCalledWith(mockSetStartLocation);
  });

  it('calculates routes for different transport modes', async () => {
    render(<RoutePlanner />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(getRoute).toHaveBeenCalledTimes(4);
    expect(getRoute).toHaveBeenCalledWith(
      mockStartLocation.coordinates,
      mockEndLocation.coordinates,
      'walking'
    );
    expect(getRoute).toHaveBeenCalledWith(
      mockStartLocation.coordinates,
      mockEndLocation.coordinates,
      'cycling'
    );
    expect(getRoute).toHaveBeenCalledWith(
      mockStartLocation.coordinates,
      mockEndLocation.coordinates,
      'driving'
    );
    expect(getRoute).toHaveBeenCalledWith(
      mockStartLocation.coordinates,
      mockEndLocation.coordinates,
      'shuttle'
    );
  });
});
