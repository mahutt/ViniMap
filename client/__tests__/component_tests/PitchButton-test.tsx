import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import PitchButton from '@/modules/map/PitchButton';
import { useMap } from '@/modules/map/MapContext';

// Mock the MapContext hook
jest.mock('@/modules/map/MapContext', () => ({
  useMap: jest.fn(),
}));

// Mock the MaterialCommunityIcons component
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MockedMaterialCommunityIcons');

describe('PitchButton', () => {
  const mockSetPitchLevel = jest.fn();
  const mockSetZoomLevel = jest.fn();
  const mockSetCenterCoordinate = jest.fn();
  const mockGetZoom = jest.fn().mockResolvedValue(10);
  const mockGetCenter = jest.fn().mockResolvedValue([45.5, -73.6]);
  const mockMapRef = {
    current: {
      getZoom: mockGetZoom,
      getCenter: mockGetCenter,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    (useMap as jest.Mock).mockReturnValue({
      pitchLevel: 0,
      setPitchLevel: mockSetPitchLevel,
      setZoomLevel: mockSetZoomLevel,
      setCenterCoordinate: mockSetCenterCoordinate,
      mapRef: mockMapRef,
    });
  });

  it('renders correctly', () => {
    const { toJSON } = render(<PitchButton />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('toggles pitch from 0 to 75 when pressed', async () => {
    (useMap as jest.Mock).mockReturnValue({
      pitchLevel: 0,
      setPitchLevel: mockSetPitchLevel,
      setZoomLevel: mockSetZoomLevel,
      setCenterCoordinate: mockSetCenterCoordinate,
      mapRef: mockMapRef,
    });

    const { UNSAFE_getAllByType } = render(<PitchButton />);
    const touchableOpacity = UNSAFE_getAllByType(TouchableOpacity)[0];

    fireEvent.press(touchableOpacity);

    await waitFor(() => {
      expect(mockGetCenter).toHaveBeenCalled();
      expect(mockGetZoom).toHaveBeenCalled();
      expect(mockSetCenterCoordinate).toHaveBeenCalledWith([45.5, -73.6]);
      expect(mockSetZoomLevel).toHaveBeenCalledWith(10);
      expect(mockSetPitchLevel).toHaveBeenCalledWith(75);
    });
  });

  it('toggles pitch from 75 to 0 when pressed', async () => {
    (useMap as jest.Mock).mockReturnValue({
      pitchLevel: 75,
      setPitchLevel: mockSetPitchLevel,
      setZoomLevel: mockSetZoomLevel,
      setCenterCoordinate: mockSetCenterCoordinate,
      mapRef: mockMapRef,
    });

    const { UNSAFE_getAllByType } = render(<PitchButton />);
    const touchableOpacity = UNSAFE_getAllByType(TouchableOpacity)[0];

    fireEvent.press(touchableOpacity);

    await waitFor(() => {
      expect(mockSetPitchLevel).toHaveBeenCalledWith(0);
    });
  });

  it('handles null mapRef gracefully', async () => {
    (useMap as jest.Mock).mockReturnValue({
      pitchLevel: 0,
      setPitchLevel: mockSetPitchLevel,
      setZoomLevel: mockSetZoomLevel,
      setCenterCoordinate: mockSetCenterCoordinate,
      mapRef: { current: null },
    });

    const { UNSAFE_getAllByType } = render(<PitchButton />);
    const touchableOpacity = UNSAFE_getAllByType(TouchableOpacity)[0];

    fireEvent.press(touchableOpacity);

    await waitFor(() => {
      expect(mockSetPitchLevel).toHaveBeenCalledWith(75);
    });
  });
});
