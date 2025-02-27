import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SymbolView } from 'expo-symbols';

jest.mock('expo-symbols', () => ({
  SymbolView: jest.fn(() => null),
}));

describe('IconSymbol', () => {
  it('renders correctly with default props', () => {
    render(<IconSymbol name="star" color="black" />);
    expect(SymbolView).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'star',
        tintColor: 'black',
        weight: 'regular',
        style: expect.arrayContaining([
          expect.objectContaining({
            width: 24,
            height: 24,
          }),
        ]),
        resizeMode: 'scaleAspectFit',
      }),
      expect.any(Object)
    );
  });

  it('renders correctly with custom size and weight', () => {
    render(<IconSymbol name="heart" color="red" size={32} weight="bold" />);
    expect(SymbolView).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'heart',
        tintColor: 'red',
        weight: 'bold',
        style: expect.arrayContaining([
          expect.objectContaining({
            width: 32,
            height: 32,
          }),
        ]),
        resizeMode: 'scaleAspectFit',
      }),
      expect.any(Object)
    );
  });

  it('applies custom styles', () => {
    const customStyle = { margin: 10 };
    render(<IconSymbol name="0.circle" color="blue" style={customStyle} />);
    expect(SymbolView).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '0.circle',
        tintColor: 'blue',
        style: expect.arrayContaining([
          expect.objectContaining({
            margin: 10,
          }),
          expect.objectContaining({
            width: 24,
            height: 24,
          }),
        ]),
        resizeMode: 'scaleAspectFit',
      }),
      expect.any(Object)
    );
  });
});
