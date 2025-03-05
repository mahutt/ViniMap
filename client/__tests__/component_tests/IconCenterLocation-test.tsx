import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CenterLocationComponent from '@/components/ui/IconCenterLocation';
import { useMap } from '@/modules/map/MapContext';
import * as Location from 'expo-location';
import CoordinateService from '@/services/CoordinateService';

const getCurrentCoordinatesSpy = jest
  .spyOn(CoordinateService, 'getCurrentCoordinates')
  .mockResolvedValue([45.5017, -73.5673]);

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

  it('renders correctly', () => {
    const { getByTestId } = render(<CenterLocationComponent />);
    const button = getByTestId('center-location-button');
    expect(button).toBeTruthy();
  });

  it('requests location permission and centers on current location if granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 45.5017, longitude: -73.5673 },
    });

    const { getByTestId } = render(<CenterLocationComponent />);
    const button = getByTestId('center-location-button');

    fireEvent.press(button);

    await waitFor(() => {
      expect(CoordinateService.getCurrentCoordinates).toHaveBeenCalled();
      expect(flyToMock).toHaveBeenCalledWith([45.5017, -73.5673]);
    });
  });
});
