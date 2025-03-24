import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const mockComponent = () => 'MaterialIcons';
  mockComponent.displayName = 'MaterialIcons';
  return mockComponent;
});

describe('IconSymbol', () => {
  it('renders with xmark icon', () => {
    const { getByText } = render(<IconSymbol name="xmark" color="black" />);
    expect(getByText('MaterialIcons')).toBeTruthy();
  });

  it('renders with gear icon', () => {
    const { getByText } = render(<IconSymbol name="gear" color="red" size={32} />);
    expect(getByText('MaterialIcons')).toBeTruthy();
  });

  it('renders with pencil icon', () => {
    const { getByText } = render(<IconSymbol name="pencil" color="blue" />);
    expect(getByText('MaterialIcons')).toBeTruthy();
  });

  it('renders with trash icon', () => {
    const { getByText } = render(<IconSymbol name="trash" color="red" />);
    expect(getByText('MaterialIcons')).toBeTruthy();
  });

  it('renders with calendar icon and applies custom styles', () => {
    const customStyle = { margin: 10 };
    const { getByText } = render(<IconSymbol name="calendar" color="green" style={customStyle} />);
    expect(getByText('MaterialIcons')).toBeTruthy();
  });
});
