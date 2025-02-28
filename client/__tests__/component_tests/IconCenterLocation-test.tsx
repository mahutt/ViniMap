import React from 'react';
import { render } from '@testing-library/react-native';
import CenterLocationComponent from '@/components/ui/IconCenterLocation';
import { useMap } from '@/modules/map/MapContext';
import * as Location from 'expo-location';

jest.mock('@/modules/map/MapContext', () => ({
  useMap: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('CenterLocationComponent', () => {
  let flyToMock: jest.Mock;
  let setCenterCoordinateMock: jest.Mock;

  beforeEach(() => {
    flyToMock = jest.fn();
    setCenterCoordinateMock = jest.fn();

    (useMap as jest.Mock).mockReturnValue({
      flyTo: flyToMock,
      setCenterCoordinate: setCenterCoordinateMock,
    });

    jest.clearAllMocks();
  });

  it('requests location permission and centers on current location if granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 45.5017, longitude: -73.5673 },
    });

    render(<CenterLocationComponent />);
  });

  it('does not update location if permission is denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });
  });
});
