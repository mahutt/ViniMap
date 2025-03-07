import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CenterLocationComponent from '@/components/ui/IconCenterLocation';
import { useMap } from '@/modules/map/MapContext';

jest.mock('@/services/CoordinateService', () => ({
  getCurrentCoordinates: jest.fn().mockResolvedValue([45.5017, -73.5673]),
}));
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
  const mockUserLocation = {
    coordinates: [45.5017, -73.5673],
    name: 'Current Location',
  };

  beforeEach(() => {
    flyToMock = jest.fn();
    setCenterCoordinateMock = jest.fn();

    (useMap as jest.Mock).mockReturnValue({
      flyTo: flyToMock,
      setCenterCoordinate: setCenterCoordinateMock,
      userLocation: mockUserLocation,
    });

    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<CenterLocationComponent />);
    const button = getByTestId('center-location-button');
    expect(button).toBeTruthy();
  });

  it('centers on user location when available', async () => {
    const { getByTestId } = render(<CenterLocationComponent />);
    const button = getByTestId('center-location-button');

    fireEvent.press(button);

    await waitFor(() => {
      expect(flyToMock).toHaveBeenCalledWith(mockUserLocation.coordinates);
    });
  });

  it('logs error when user location is not available', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (useMap as jest.Mock).mockReturnValueOnce({
      flyTo: flyToMock,
      setCenterCoordinate: setCenterCoordinateMock,
      userLocation: null,
    });

    const { getByTestId } = render(<CenterLocationComponent />);
    const button = getByTestId('center-location-button');

    fireEvent.press(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('User location not available');
      expect(flyToMock).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles undefined userLocation correctly', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    (useMap as jest.Mock).mockReturnValueOnce({
      flyTo: flyToMock,
      setCenterCoordinate: setCenterCoordinateMock,
      userLocation: undefined,
    });

    const { getByTestId } = render(<CenterLocationComponent />);
    const button = getByTestId('center-location-button');

    fireEvent.press(button);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('User location not available');
      expect(flyToMock).not.toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
