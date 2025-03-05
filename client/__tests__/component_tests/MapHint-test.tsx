import React from 'react';
import { render } from '@testing-library/react-native';
import MapHint from '@/components/MapHint';
import { useMap, MapState } from '@/modules/map/MapContext';

// Mock the MapContext hook
jest.mock('@/modules/map/MapContext', () => ({
  useMap: jest.fn(),
  MapState: {
    Idle: 'idle',
    Information: 'information',
    RoutePlanning: 'routePlanning',
    SelectingStartLocation: 'selectingStartLocation',
    SelectingEndLocation: 'selectingEndLocation',
  },
}));

describe('MapHint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hint when state is SelectingStartLocation', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.SelectingStartLocation,
    });

    const { getByText } = render(<MapHint />);
    expect(getByText('Tap anywhere to set your start location')).toBeTruthy();
  });

  it('renders hint when state is SelectingEndLocation', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.SelectingEndLocation,
    });

    const { getByText } = render(<MapHint />);
    expect(getByText('Tap anywhere to set your destination')).toBeTruthy();
  });

  it('does not render anything when state is Idle', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.Idle,
    });

    const { toJSON } = render(<MapHint />);
    expect(toJSON()).toBeNull();
  });

  it('does not render anything when state is Information', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.Information,
    });

    const { toJSON } = render(<MapHint />);
    expect(toJSON()).toBeNull();
  });

  it('does not render anything when state is RoutePlanning', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.RoutePlanning,
    });

    const { toJSON } = render(<MapHint />);
    expect(toJSON()).toBeNull();
  });
});
