import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import TaskCard from '@/components/TaskCard';

// Mock the IconSymbol component
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => 'IconSymbol',
}));

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

  it('matches the snapshot', () => {
    const { toJSON } = render(<TaskCard {...mockProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders the task text correctly', () => {
    const { getByText } = render(<TaskCard {...mockProps} />);
    expect(getByText('Sample Task')).toBeTruthy();
  });

  it('applies selected styles when task is selected', () => {
    const selectedProps = { ...mockProps, selected: true };
    const { toJSON } = render(<TaskCard {...selectedProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('calls onSelect when the checkbox is pressed', () => {
    const { UNSAFE_getAllByType } = render(<TaskCard {...mockProps} />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    // The first TouchableOpacity should be the selection square
    fireEvent.press(touchables[0]);
    expect(mockProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls modifyTask when the edit button is pressed', () => {
    const { UNSAFE_getAllByType } = render(<TaskCard {...mockProps} />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    // The second TouchableOpacity should be the edit button
    fireEvent.press(touchables[1]);
    expect(mockProps.modifyTask).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when the delete button is pressed', () => {
    const { UNSAFE_getAllByType } = render(<TaskCard {...mockProps} />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    // The third TouchableOpacity should be the delete button
    fireEvent.press(touchables[2]);
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });
});
