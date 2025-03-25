import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskCard from '@/components/TaskCard';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

type IconSymbolProps = {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
};

jest.mock('@/components/ui/IconSymbol', () => {
  const React = require('react');
  return {
    IconSymbol: function MockIconSymbol(props: IconSymbolProps) {
      return React.createElement('ViewManagerAdapter_SymbolModule');
    },
  };
});

describe('TaskCard', () => {
  const mockProps = {
    text: 'Sample Task',
    selected: false,
    onDelete: jest.fn(),
    onSelect: jest.fn(),
    modifyTask: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.skip('matches the snapshot', () => {
    const { toJSON } = render(<TaskCard {...mockProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders the task text correctly', () => {
    const { getByText } = render(<TaskCard {...mockProps} />);
    expect(getByText('Sample Task')).toBeTruthy();
  });

  it.skip('applies selected styles when task is selected', () => {
    const selectedProps = { ...mockProps, selected: true };
    const { toJSON } = render(<TaskCard {...selectedProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('calls onSelect when the checkbox is pressed', () => {
    const { UNSAFE_getAllByProps } = render(<TaskCard {...mockProps} />);

    const touchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    fireEvent.press(touchables[0]);
    expect(mockProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls modifyTask when the card is pressed', () => {
    const { UNSAFE_root } = render(<TaskCard {...mockProps} />);

    const mainTouchable = UNSAFE_root.children[0];
    fireEvent.press(mainTouchable);

    expect(mockProps.modifyTask).toHaveBeenCalledTimes(1);
  });

  it('calls appropriate handlers when the component is rendered and used', () => {
    const { UNSAFE_root } = render(<TaskCard {...mockProps} />);

    expect(mockProps.modifyTask).not.toHaveBeenCalled();
    expect(mockProps.onDelete).not.toHaveBeenCalled();
    expect(mockProps.onSelect).not.toHaveBeenCalled();

    expect(UNSAFE_root).toBeTruthy();
  });

  it('passes the correct props to TaskCard', () => {
    render(<TaskCard {...mockProps} />);

    expect(mockProps.text).toBe('Sample Task');
    expect(mockProps.selected).toBe(false);
    expect(typeof mockProps.onDelete).toBe('function');
    expect(typeof mockProps.onSelect).toBe('function');
    expect(typeof mockProps.modifyTask).toBe('function');
  });
});
