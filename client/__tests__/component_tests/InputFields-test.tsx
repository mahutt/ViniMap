import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Pressable } from 'react-native';
import InputFields from '@/components/ui/RoutePlanner Components/InputFields';
import { MapState, useMap } from '@/modules/map/MapContext';

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => `Ionicons-${name}`,
}));

jest.mock('@/modules/map/MapContext', () => ({
  useMap: jest.fn(),
  MapState: {
    Idle: 'idle',
    RoutePlanning: 'routePlanning',
  },
}));

jest.mock('@/components/LocationInput', () => {
  interface MockLocationInputProps {
    placeholder: string;
    isStartLocation: boolean;
  }

  return function MockLocationInput(props: MockLocationInputProps) {
    const { Text } = require('react-native');
    return (
      <Text>
        {props.placeholder}-{props.isStartLocation ? 'start' : 'end'}
      </Text>
    );
  };
});

describe('InputFields', () => {
  const mockSetState = jest.fn();
  const mockSetStartLocation = jest.fn();
  const mockSetEndLocation = jest.fn();
  const startLocation = 'Library';
  const endLocation = 'Cafeteria';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the useMap hook
    (useMap as jest.Mock).mockReturnValue({
      setState: mockSetState,
      startLocation,
      setStartLocation: mockSetStartLocation,
      endLocation,
      setEndLocation: mockSetEndLocation,
    });
  });

  it('renders both LocationInput components with correct props', () => {
    const { getByText } = render(<InputFields />);

    expect(getByText('Start location-start')).toBeTruthy();
    expect(getByText('End location-end')).toBeTruthy();
  });

  it('calls setState when close button is pressed', () => {
    const { UNSAFE_getAllByType } = render(<InputFields />);
    const pressables = UNSAFE_getAllByType(Pressable);

    fireEvent.press(pressables[0]);

    expect(mockSetState).toHaveBeenCalledWith(MapState.Idle);
  });

  it('swaps locations when swap button is pressed', () => {
    const { UNSAFE_getAllByType } = render(<InputFields />);
    const pressables = UNSAFE_getAllByType(Pressable);

    fireEvent.press(pressables[1]);

    expect(mockSetStartLocation).toHaveBeenCalledWith(endLocation);
    expect(mockSetEndLocation).toHaveBeenCalledWith(startLocation);
  });

  it('passes empty locations if useMap returns undefined locations', () => {
    (useMap as jest.Mock).mockReturnValue({
      setState: mockSetState,
      startLocation: undefined,
      setStartLocation: mockSetStartLocation,
      endLocation: undefined,
      setEndLocation: mockSetEndLocation,
    });

    const { getByText } = render(<InputFields />);

    expect(getByText('Start location-start')).toBeTruthy();
    expect(getByText('End location-end')).toBeTruthy();
  });
});
