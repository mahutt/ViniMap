import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CenterLocationComponent from '@/components/ui/IconCenterLocation';
import { useMap } from '@/modules/map/MapContext';
import * as Location from 'expo-location';
import { TouchableOpacity } from 'react-native';

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
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    flyToMock = jest.fn();
    setCenterCoordinateMock = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    (useMap as jest.Mock).mockReturnValue({
      flyTo: flyToMock,
      setCenterCoordinate: setCenterCoordinateMock,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('renders correctly', () => {
    const { UNSAFE_root } = render(<CenterLocationComponent />);
    const buttons = UNSAFE_root.findAllByType(TouchableOpacity);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('requests location permission and centers on current location if granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 45.5017, longitude: -73.5673 },
    });

    const { UNSAFE_root } = render(<CenterLocationComponent />);
    const button = UNSAFE_root.findAllByType(TouchableOpacity)[0];

    fireEvent.press(button);

    await new Promise((resolve) => setImmediate(resolve));

    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
    expect(setCenterCoordinateMock).toHaveBeenCalledWith([45.5017, -73.5673]);
    expect(flyToMock).toHaveBeenCalledWith([-73.5673, 45.5017]);
  });
});
