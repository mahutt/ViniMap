import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Pressable } from 'react-native';
import TransportModes from '@/components/ui/RoutePlanner Components/TransportModes';

// Mock the MapService formatDuration function
jest.mock('@/modules/map/MapService', () => ({
  formatDuration: jest.fn((duration) => `${duration} min`),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'Ionicons-Mock',
}));

describe('TransportModes', () => {
  const mockOnMode = jest.fn();
  const defaultProps = {
    selectedMode: 'walking',
    onMode: mockOnMode,
    durations: {
      walking: 10,
      driving: 3,
    },
    isRouteFound: true,
    modes: [
      { name: 'walking', icon: 'walk-outline' },
      { name: 'driving', icon: 'car-outline' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders transport modes correctly', () => {
    const { getByTestId } = render(
      <View testID="wrapper">
        <TransportModes {...defaultProps} />
      </View>
    );

    expect(getByTestId('wrapper')).toBeTruthy();
  });

  it('calls onMode when a transport button is pressed', () => {
    const { getByText } = render(<TransportModes {...defaultProps} />);
    const drivingButton = getByText('3 min').parent;
    expect(drivingButton).toBeTruthy();
    fireEvent.press(drivingButton);
    expect(mockOnMode).toHaveBeenCalledWith('driving');
  });

  it('does not display durations when isRouteFound is false', () => {
    const noRouteProps = {
      ...defaultProps,
      isRouteFound: false,
    };

    const { queryByText } = render(<TransportModes {...noRouteProps} />);
    expect(queryByText('10 min')).toBeNull();
    expect(queryByText('3 min')).toBeNull();
  });

  it('handles disabled transport modes correctly', () => {
    const disabledModeProps = {
      ...defaultProps,
      durations: {
        walking: 10,
        driving: null,
      },
    };

    const { getByText, queryByText } = render(<TransportModes {...disabledModeProps} />);
    expect(getByText('10 min')).toBeTruthy();
    expect(queryByText('3 min')).toBeNull();
  });

  it('does not call onMode when a disabled transport button is pressed', () => {
    const disabledModeProps = {
      ...defaultProps,
      durations: {
        walking: 10,
        driving: null,
      },
    };

    const { UNSAFE_getAllByType } = render(<TransportModes {...disabledModeProps} />);

    // Get all Pressable components
    const pressables = UNSAFE_getAllByType(Pressable);
    expect(pressables.length).toBe(2);
    fireEvent.press(pressables[1]);
    expect(mockOnMode).not.toHaveBeenCalled();
  });

  it('applies the correct styles for selected mode', () => {
    const { UNSAFE_getAllByType } = render(<TransportModes {...defaultProps} />);

    // Get all Pressables
    const pressables = UNSAFE_getAllByType(Pressable);
    const walkingPressable = pressables[0];
    expect(walkingPressable.props).toBeDefined();
    expect(walkingPressable.props.style).toBeDefined();

    if (Array.isArray(walkingPressable.props.style)) {
      expect(walkingPressable.props.style.length).toBeGreaterThan(0);
    }
  });

  it('handles all combinations of isRouteFound and disabled modes', () => {
    // Case 1: isRouteFound=false with null durations
    const edgeCaseProps1 = {
      ...defaultProps,
      isRouteFound: false,
      durations: {
        walking: null,
        driving: null,
      },
    };

    const { UNSAFE_getAllByType: getAllPressables1 } = render(
      <TransportModes {...edgeCaseProps1} />
    );

    const pressables1 = getAllPressables1(Pressable);
    expect(pressables1.length).toBe(2);

    fireEvent.press(pressables1[0]);
    expect(mockOnMode).toHaveBeenCalledWith('walking');
    mockOnMode.mockClear();

    fireEvent.press(pressables1[1]);
    expect(mockOnMode).toHaveBeenCalledWith('driving');
    mockOnMode.mockClear();

    // Case 2: isRouteFound=true with all transport modes having null durations
    const edgeCaseProps2 = {
      ...defaultProps,
      isRouteFound: true,
      selectedMode: '',
      durations: {
        walking: null,
        driving: null,
      },
    };

    const { UNSAFE_getAllByType: getAllPressables2 } = render(
      <TransportModes {...edgeCaseProps2} />
    );

    const pressables2 = getAllPressables2(Pressable);
    fireEvent.press(pressables2[0]);
    fireEvent.press(pressables2[1]);
    expect(mockOnMode).not.toHaveBeenCalled();
  });
});
