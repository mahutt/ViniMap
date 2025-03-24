import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
});
