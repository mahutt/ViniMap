import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import FloorControl from '@/components/FloorControl';
import { useMap } from '@/modules/map/MapContext';
import { IconSymbolName } from '@/components/ui/IconSymbol';

// Mock dependencies
jest.mock('@/modules/map/MapContext', () => ({
  useMap: jest.fn(),
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: (props: { name: IconSymbolName; size?: number; color: string }) => {
    const { Text } = require('react-native');
    return <Text>{`IconSymbol-${props.name}-${props.size}-${props.color}`}</Text>;
  },
}));

describe('FloorControl', () => {
  const mockSetLevel = jest.fn();
  const defaultLevel = 2;
  const mockIndoorMap = {
    levelsRange: {
      min: 1,
      max: 3,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useMap as jest.Mock).mockReturnValue({
      level: defaultLevel,
      setLevel: mockSetLevel,
      indoorMap: mockIndoorMap,
    });
  });

  it('renders properly with correct level displayed', () => {
    const { getByText } = render(<FloorControl />);
    expect(getByText('2')).toBeTruthy();
  });

  it('returns null when indoorMap is null', () => {
    (useMap as jest.Mock).mockReturnValue({
      level: defaultLevel,
      setLevel: mockSetLevel,
      indoorMap: null,
    });

    const { toJSON } = render(<FloorControl />);
    expect(toJSON()).toBeNull();
  });

  it('returns null when level is null', () => {
    (useMap as jest.Mock).mockReturnValue({
      level: null,
      setLevel: mockSetLevel,
      indoorMap: mockIndoorMap,
    });

    const { toJSON } = render(<FloorControl />);
    expect(toJSON()).toBe(null);
  });

  it('increases level when up button is pressed', () => {
    const { getAllByRole } = render(<FloorControl />);
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[0]);
    expect(mockSetLevel).toHaveBeenCalledWith(defaultLevel + 1);
  });

  it('decreases level when down button is pressed', () => {
    const { getAllByRole } = render(<FloorControl />);
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[1]);
    expect(mockSetLevel).toHaveBeenCalledWith(defaultLevel - 1);
  });

  it('disables up button when at max level', () => {
    (useMap as jest.Mock).mockReturnValue({
      level: mockIndoorMap.levelsRange.max,
      setLevel: mockSetLevel,
      indoorMap: mockIndoorMap,
    });

    const { UNSAFE_getAllByType } = render(<FloorControl />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    expect(touchables[0].props.disabled).toBe(true);
    expect(touchables[0].props.style.opacity).toBe(0.3);
  });

  it('disables down button when at min level', () => {
    (useMap as jest.Mock).mockReturnValue({
      level: mockIndoorMap.levelsRange.min,
      setLevel: mockSetLevel,
      indoorMap: mockIndoorMap,
    });

    const { UNSAFE_getAllByType } = render(<FloorControl />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    expect(touchables[1].props.disabled).toBe(true);
    expect(touchables[1].props.style.opacity).toBe(0.3);
  });

  it('does not call setLevel when trying to go above max level', () => {
    (useMap as jest.Mock).mockReturnValue({
      level: mockIndoorMap.levelsRange.max,
      setLevel: mockSetLevel,
      indoorMap: mockIndoorMap,
    });

    const { getAllByRole } = render(<FloorControl />);
    const buttons = getAllByRole('button');

    fireEvent.press(buttons[0]);

    expect(mockSetLevel).not.toHaveBeenCalled();
  });

  it('does not call setLevel when trying to go below min level', () => {
    (useMap as jest.Mock).mockReturnValue({
      level: mockIndoorMap.levelsRange.min,
      setLevel: mockSetLevel,
      indoorMap: mockIndoorMap,
    });

    const { getAllByRole } = render(<FloorControl />);
    const buttons = getAllByRole('button');

    fireEvent.press(buttons[1]);

    expect(mockSetLevel).not.toHaveBeenCalled();
  });
});
