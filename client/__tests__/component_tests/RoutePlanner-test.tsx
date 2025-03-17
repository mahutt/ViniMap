import React from 'react';
import { render, act } from '@testing-library/react-native';
import RoutePlanner from '@/components/RoutePlanner';
import { MapState } from '@/modules/map/MapContext';
import { getRoute } from '@/modules/map/MapService';

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

  const mockUserLocation = {
    coordinates: [51.5074, -0.1278],
    name: 'Current Location',
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
      userLocation: mockUserLocation,
      setStartLocation: mockSetStartLocation,
      loadRouteFromCoordinates: mockLoadRouteFromCoordinates,
    });

    (getRoute as jest.Mock).mockImplementation((start, end, mode) => {
      if (mode === 'shuttle') {
        return Promise.resolve(null);
      }

      let duration;
      if (mode === 'walking') {
        duration = 120;
      } else if (mode === 'cycling') {
        duration = 60;
      } else {
        duration = 30;
      }

      let distance;
      if (mode === 'walking') {
        distance = 5000;
      } else if (mode === 'cycling') {
        distance = 3000;
      } else {
        distance = 1500;
      }

      return Promise.resolve({
        duration,
        distance,
      });
    });
  });

  it('renders correctly in route planning mode', async () => {
    const { toJSON } = render(<RoutePlanner />);

    expect(toJSON()).toBeTruthy();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockLoadRouteFromCoordinates).toHaveBeenCalledWith(
      mockStartLocation,
      mockEndLocation,
      'walking'
    );
  });

  it('uses userLocation when start location is not provided', async () => {
    const { useMap } = require('@/modules/map/MapContext');
    useMap.mockReturnValueOnce({
      state: MapState.RoutePlanning,
      startLocation: null,
      endLocation: mockEndLocation,
      userLocation: mockUserLocation,
      setStartLocation: mockSetStartLocation,
      loadRouteFromCoordinates: mockLoadRouteFromCoordinates,
    });

    render(<RoutePlanner />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockSetStartLocation).toHaveBeenCalledWith(mockUserLocation);
  });

  it('calculates routes for different transport modes', async () => {
    render(<RoutePlanner />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(getRoute).toHaveBeenCalledTimes(4);
    expect(getRoute).toHaveBeenCalledWith(mockStartLocation, mockEndLocation, 'walking');
    expect(getRoute).toHaveBeenCalledWith(mockStartLocation, mockEndLocation, 'cycling');
    expect(getRoute).toHaveBeenCalledWith(mockStartLocation, mockEndLocation, 'driving');
    expect(getRoute).toHaveBeenCalledWith(mockStartLocation, mockEndLocation, 'shuttle');
  });
});
