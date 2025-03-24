import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

jest.mock('@expo/vector-icons/MaterialIcons', () => jest.fn(() => null));

describe('IconSymbol', () => {
  it('renders correctly with default props', () => {
    render(<IconSymbol name="xmark" color="black" />);
    expect(MaterialIcons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'close',
        color: 'black',
        size: 24,
      }),
      expect.any(Object)
    );
  });

  it('renders correctly with custom size', () => {
    render(<IconSymbol name="gear" color="red" size={32} />);
    expect(MaterialIcons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'settings',
        color: 'red',
        size: 32,
      }),
      expect.any(Object)
    );
  });

  it('renders new pencil icon correctly', () => {
    render(<IconSymbol name="pencil" color="blue" />);
    expect(MaterialIcons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'edit',
        color: 'blue',
      }),
      expect.any(Object)
    );
  });

  it('renders new trash icon correctly', () => {
    render(<IconSymbol name="trash" color="red" />);
    expect(MaterialIcons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'delete',
        color: 'red',
      }),
      expect.any(Object)
    );
  });

  it('applies custom styles', () => {
    const customStyle = { margin: 10 };
    render(<IconSymbol name="calendar" color="green" style={customStyle} />);
    expect(MaterialIcons).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'calendar-today',
        color: 'green',
        style: customStyle,
      }),
      expect.any(Object)
    );
  });
});
