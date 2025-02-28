import { render, fireEvent } from '@testing-library/react-native';
import ToggleCampusButton from '@/components/ui/ToggleCampusButton';
import { MapProvider } from '@/modules/map/MapContext';
import React from 'react';

const mockFlyTo = jest.fn();

jest.mock('@/modules/map/MapContext', () => {
  const actual = jest.requireActual('@/modules/map/MapContext');

  const mockUseMap = () => ({
    flyTo: mockFlyTo,
  });

  return {
    ...actual,
    MapProvider: actual.MapProvider,
    useMap: mockUseMap,
  };
});

const isTextActive = (textElement: any): boolean => {
  if (!textElement?.props?.style) {
    return false;
  }

  const styles = textElement.props.style;

  if (Array.isArray(styles)) {
    return styles.some((style: any) => style && style.color === 'white');
  } else if (typeof styles === 'object') {
    return styles.color === 'white';
  }

  return false;
};

describe('<ToggleCampusButton />', () => {
  beforeEach(() => {
    mockFlyTo.mockClear();
  });

  test('ToggleCampusButton renders correctly', () => {
    const tree = render(
      <MapProvider>
        <ToggleCampusButton />
      </MapProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('Default selected location is SGW', () => {
    const { getByText } = render(
      <MapProvider>
        <ToggleCampusButton />
      </MapProvider>
    );

    const sgwText = getByText('SGW');
    const loyText = getByText('LOY');

    expect(isTextActive(sgwText)).toBe(true);
    expect(isTextActive(loyText)).toBe(false);
  });

  test('Clicking LOY button calls flyTo with LOY coordinates', () => {
    const { getByText } = render(
      <MapProvider>
        <ToggleCampusButton />
      </MapProvider>
    );

    fireEvent.press(getByText('LOY'));

    expect(mockFlyTo).toHaveBeenCalledWith([-73.6391, 45.4581]);

    const loyText = getByText('LOY');
    const sgwText = getByText('SGW');

    expect(isTextActive(loyText)).toBe(true);
    expect(isTextActive(sgwText)).toBe(false);
  });

  test('Clicking SGW button after LOY calls flyTo with SGW coordinates', () => {
    const { getByText } = render(
      <MapProvider>
        <ToggleCampusButton />
      </MapProvider>
    );

    fireEvent.press(getByText('LOY'));

    fireEvent.press(getByText('SGW'));

    expect(mockFlyTo).toHaveBeenNthCalledWith(2, [-73.5789, 45.4973]);

    const sgwText = getByText('SGW');
    const loyText = getByText('LOY');

    expect(isTextActive(sgwText)).toBe(true);
    expect(isTextActive(loyText)).toBe(false);
  });
});
