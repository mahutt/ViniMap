import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomFrame from '@/components/ui/RoutePlanner Components/BottomFrame';
import { formatDuration } from '@/modules/map/MapService';

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@/modules/map/MapService', () => ({
  formatDuration: jest.fn((duration) => `${duration} min`),
}));

describe('BottomFrame', () => {
  const mockProps = {
    selectedMode: 'walking',
    modeIcon: <Ionicons name="walk-outline" size={24} color="#852C3A" />,
    durations: {
      walking: 15,
      cycling: 8,
      driving: 5,
    },
    distances: {
      walking: 1200,
      cycling: 1250,
      driving: 1500,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Snapshot test
  it('renders correctly with provided props', () => {
    const { toJSON } = render(<BottomFrame {...mockProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  // Core functionality tests
  it('displays the correct duration and distance for the selected mode', () => {
    const { getByText } = render(<BottomFrame {...mockProps} />);
    expect(formatDuration).toHaveBeenCalledWith(15);
    expect(getByText('15 min')).toBeTruthy();
    expect(getByText('(1.20 km)')).toBeTruthy();
  });

  it('handles null values appropriately', () => {
    const propsWithNulls = {
      ...mockProps,
      durations: { ...mockProps.durations, walking: null },
      distances: { ...mockProps.distances, walking: null },
    };

    const { getByText } = render(<BottomFrame {...propsWithNulls} />);
    expect(getByText('0')).toBeTruthy();
    expect(getByText('(0.00 km)')).toBeTruthy();
  });

  it('renders the start button that can be pressed', () => {
    const { getByText } = render(<BottomFrame {...mockProps} />);
    const startButton = getByText('Start');
    expect(startButton).toBeTruthy();

    expect(() => {
      fireEvent.press(startButton.parent);
    }).not.toThrow();
  });
});
