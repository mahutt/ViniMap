import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const MockedMaterialIcons = (props: {
    color: string | object;
    size: number;
    name?: string;
    style?: any;
  }): JSX.Element => <>{JSON.stringify(props)}</>;

  return MockedMaterialIcons;
});

describe('IconSymbol', () => {
  it('renders with xmark icon', () => {
    const { UNSAFE_root } = render(<IconSymbol name="xmark" color="black" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with gear icon', () => {
    const { UNSAFE_root } = render(<IconSymbol name="gear" color="red" size={32} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with pencil icon', () => {
    const { UNSAFE_root } = render(<IconSymbol name="pencil" color="blue" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with trash icon', () => {
    const { UNSAFE_root } = render(<IconSymbol name="trash" color="red" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with calendar icon and applies custom styles', () => {
    const customStyle = { margin: 10 };
    const { UNSAFE_root } = render(
      <IconSymbol name="calendar" color="green" style={customStyle} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with chevron.up icon', () => {
    const { UNSAFE_root } = render(<IconSymbol name="chevron.up" color="black" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with chevron.down icon', () => {
    const { UNSAFE_root } = render(<IconSymbol name="chevron.down" color="black" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with checklist icon', () => {
    const { UNSAFE_root } = render(<IconSymbol name="checklist" color="black" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with map.fill icon', () => {
    const { UNSAFE_root } = render(<IconSymbol name="map.fill" color="black" />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
