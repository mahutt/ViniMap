import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskCard from '@/components/TaskCard';

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
    const { getAllByRole } = render(<TaskCard {...mockProps} />);

    const touchableElements = getAllByRole('button');
    fireEvent.press(touchableElements[0]);

    expect(mockProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls modifyTask when the edit button is pressed', () => {
    const { getAllByRole } = render(<TaskCard {...mockProps} />);

    const touchableElements = getAllByRole('button');
    fireEvent.press(touchableElements[1]);

    expect(mockProps.modifyTask).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when the delete button is pressed', () => {
    const { getAllByRole } = render(<TaskCard {...mockProps} />);

    const touchableElements = getAllByRole('button');
    fireEvent.press(touchableElements[2]);

    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });
});
