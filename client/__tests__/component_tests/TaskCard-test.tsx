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

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: (props: IconSymbolProps) => {
    return <React.Fragment>IconSymbol</React.Fragment>;
  },
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
    const { UNSAFE_getAllByProps } = render(<TaskCard {...mockProps} />);

    const touchables = UNSAFE_getAllByProps({ activeOpacity: 0.7 });
    fireEvent.press(touchables[0]);
    expect(mockProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('calls modifyTask when the edit button is pressed', () => {
    const { UNSAFE_getAllByProps } = render(<TaskCard {...mockProps} />);

    const iconButtons = UNSAFE_getAllByProps({
      style: expect.objectContaining({ backgroundColor: '#852C3A' }),
    });

    fireEvent.press(iconButtons[0]);
    expect(mockProps.modifyTask).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when the delete button is pressed', () => {
    const { UNSAFE_getAllByProps } = render(<TaskCard {...mockProps} />);

    const iconButtons = UNSAFE_getAllByProps({
      style: expect.objectContaining({ backgroundColor: '#852C3A' }),
    });

    fireEvent.press(iconButtons[1]);
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });
});
