import React from 'react';
import { render } from '@testing-library/react-native';
import POIMarker from '@/components/POIMarker';
import { POIType } from '@/modules/map/PointsOfInterestTypes';

interface IoniconsProps {
  name: string;
  color: string;
  size: number;
}

jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: IoniconsProps) => null,
}));

const mockIconsImpl = jest.fn();
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: { name: string; color: string; size: number }) => {
    mockIconsImpl(props);
    return null;
  },
}));

describe('POIMarker Component', () => {
  beforeEach(() => {
    mockIconsImpl.mockClear();
  });

  const POI_CONFIG = [
    { type: 'bixi', icon: 'bicycle-outline', color: '#5cb85c' },
    { type: 'metro', icon: 'subway-outline', color: '#0d6efd' },
    { type: 'bus_station', icon: 'bus-outline', color: '#6f42c1' },
    { type: 'restaurant', icon: 'restaurant-outline', color: '#fd7e14' },
    { type: 'park', icon: 'leaf-outline', color: '#20c997' },
    { type: 'library', icon: 'book-outline', color: '#6c757d' },
    { type: 'shopping', icon: 'cart-outline', color: '#dc3545' },
    { type: 'other', icon: 'location-outline', color: '#adb5bd' },
  ];

  it('renders correctly with snapshot for each POI type', () => {
    POI_CONFIG.forEach(({ type }) => {
      const { toJSON } = render(<POIMarker type={type as POIType} />);
      expect(toJSON()).toMatchSnapshot(`POIMarker with type ${type}`);
    });
  });

  it('uses correct icon for each POI type', () => {
    POI_CONFIG.forEach(({ type, icon }) => {
      render(<POIMarker type={type as POIType} />);

      expect(mockIconsImpl).toHaveBeenCalledWith(
        expect.objectContaining({
          name: icon,
          color: 'white',
          size: expect.any(Number),
        })
      );

      mockIconsImpl.mockClear();
    });
  });

  it('falls back to location-outline for unknown types', () => {
    // @ts-ignore - Passing an invalid type to test fallback behavior
    render(<POIMarker type="invalid" />);

    expect(mockIconsImpl).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'location-outline',
        color: 'white',
        size: expect.any(Number),
      })
    );
  });

  it('renders with correct structure', () => {
    const { toJSON } = render(<POIMarker type="park" />);
    const result = toJSON();

    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('props');
    expect(result).toHaveProperty('children');
  });
});
