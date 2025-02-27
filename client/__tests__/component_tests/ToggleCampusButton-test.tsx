import { render, fireEvent } from '@testing-library/react-native';
import ToggleCampusButton from '@/components/ui/ToggleCampusButton';
import { MapProvider, useMap } from '@/modules/map/MapContext';
import React from 'react';

jest.mock('@/modules/map/MapContext', () => {
  const flyToMock = jest.fn();

  return {
    MapProvider: ({ children }: { children: React.ReactNode }) => children,

    useMap: () => ({
      flyTo: flyToMock,
    }),
  };
});

describe('<ToggleCampusButton />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    const sgwButton = getByText('SGW').parent;
    const loyButton = getByText('LOY').parent;

    expect(sgwButton.props.style).toContainEqual({ backgroundColor: '#800000' });
    expect(loyButton.props.style).not.toContainEqual({ backgroundColor: '#800000' });
  });

  test('Clicking LOY button calls flyTo with LOY coordinates', () => {
    const { getByText } = render(
      <MapProvider>
        <ToggleCampusButton />
      </MapProvider>
    );

    fireEvent.press(getByText('LOY'));

    const { flyTo } = useMap();

    expect(flyTo).toHaveBeenCalledWith([-73.6391, 45.4581]);

    const loyButton = getByText('LOY').parent;
    expect(loyButton.props.style).toContainEqual({ backgroundColor: '#800000' });

    const sgwButton = getByText('SGW').parent;
    expect(sgwButton.props.style).not.toContainEqual({ backgroundColor: '#800000' });
  });

  test('Clicking SGW button after LOY calls flyTo with SGW coordinates', () => {
    const { getByText } = render(
      <MapProvider>
        <ToggleCampusButton />
      </MapProvider>
    );

    fireEvent.press(getByText('LOY'));

    fireEvent.press(getByText('SGW'));

    const { flyTo } = useMap();

    expect(flyTo).toHaveBeenNthCalledWith(2, [-73.5789, 45.4973]);

    const sgwButton = getByText('SGW').parent;
    expect(sgwButton.props.style).toContainEqual({ backgroundColor: '#800000' });

    const loyButton = getByText('LOY').parent;
    expect(loyButton.props.style).not.toContainEqual({ backgroundColor: '#800000' });
  });
});
