import { render, fireEvent } from '@testing-library/react-native';
import ToggleCampusButton from '@/components/ui/ToggleCampusButton';
import { MapProvider, useMap } from '@/modules/map/MapContext';
import React from 'react';

// Mock the MapContext module
jest.mock('@/modules/map/MapContext', () => {
  const flyToMock = jest.fn();

  return {
    // Preserve the actual MapProvider with properly typed children
    MapProvider: ({ children }: { children: React.ReactNode }) => children,

    // Mock the useMap hook to return a mocked flyTo function
    useMap: () => ({
      flyTo: flyToMock,
    }),
  };
});

// Helper function to check if a text element has active styling (white color)
const isTextActive = (textElement: any): boolean => {
  if (!textElement || !textElement.props || !textElement.props.style) {
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
    // Clear mock calls between tests
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

    // Get the text elements
    const sgwText = getByText('SGW');
    const loyText = getByText('LOY');

    // Check if text is active (white color indicates active state)
    expect(isTextActive(sgwText)).toBe(true);
    expect(isTextActive(loyText)).toBe(false);
  });

  test('Clicking LOY button calls flyTo with LOY coordinates', () => {
    const { getByText } = render(
      <MapProvider>
        <ToggleCampusButton />
      </MapProvider>
    );

    // Simulate clicking the LOY button
    fireEvent.press(getByText('LOY'));

    // Get the mocked flyTo function
    const { flyTo } = useMap();

    // Check that flyTo was called with LOY coordinates
    expect(flyTo).toHaveBeenCalledWith([-73.6391, 45.4581]);

    // Get the text elements
    const loyText = getByText('LOY');
    const sgwText = getByText('SGW');

    // Check if text is active
    expect(isTextActive(loyText)).toBe(true);
    expect(isTextActive(sgwText)).toBe(false);
  });

  test('Clicking SGW button after LOY calls flyTo with SGW coordinates', () => {
    const { getByText } = render(
      <MapProvider>
        <ToggleCampusButton />
      </MapProvider>
    );

    // First click LOY
    fireEvent.press(getByText('LOY'));

    // Then click SGW
    fireEvent.press(getByText('SGW'));

    // Get the mocked flyTo function
    const { flyTo } = useMap();

    // Check flyTo was called with SGW coordinates on the second call
    expect(flyTo).toHaveBeenNthCalledWith(2, [-73.5789, 45.4973]);

    // Get the text elements
    const sgwText = getByText('SGW');
    const loyText = getByText('LOY');

    // Check if text is active
    expect(isTextActive(sgwText)).toBe(true);
    expect(isTextActive(loyText)).toBe(false);
  });
});
