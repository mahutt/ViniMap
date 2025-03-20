import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LocationInput from '@/components/LocationInput';
import { MapProvider, Location, MapState } from '@/modules/map/MapContext';

const TEST_LOCATION = { name: 'Test Location', coordinates: [1, 2] as [number, number] };
const CURRENT_LOCATION = { name: 'Current location', coordinates: [20, 10] as [number, number] };

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@/services/CoordinateService', () => ({
  getCurrentCoordinates: jest.fn().mockResolvedValue([20, 10]),
  watchPosition: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

// Mock the map context
const mockSetState = jest.fn();
const mockSetUserLocation = jest.fn();

let mockUserLocation: { name: string; coordinates: [number, number] } | null = {
  name: 'Current location',
  coordinates: [20, 10] as [number, number],
};

jest.mock('@/modules/map/MapContext', () => {
  const React = require('react');
  const MapContext = React.createContext(null);

  const initialState = {
    state: 0,
    setState: mockSetState,
    userLocation: {
      name: 'Current location',
      coordinates: [20, 10],
    },
    setUserLocation: mockSetUserLocation,
  };

  const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <MapContext.Provider value={initialState}>{children}</MapContext.Provider>;
  };

  const useMap = () => {
    return initialState;
  };

  return {
    MapContext,
    MapProvider,
    useMap,
    MapState: {
      Default: 0,
      SelectingStartLocation: 1,
      SelectingEndLocation: 2,
    },
  };
});

// Mock the LocationsAutocomplete component
jest.mock('@/components/LocationsAutocomplete', () => {
  return function MockLocationsAutocomplete({
    callback,
    query,
  }: {
    callback: (location: Location) => void;
    query: string;
  }) {
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <View testID="locations-autocomplete">
        <TouchableOpacity
          testID="autocomplete-option"
          onPress={() =>
            callback({
              name: 'Test Location',
              coordinates: [1, 2] as [number, number],
            })
          }>
          <Text>Mock Autocomplete for: {query}</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

describe('LocationInput', () => {
  const defaultProps = {
    location: null,
    setLocation: jest.fn(),
    ionIconName: 'pin-outline' as const,
    placeholder: 'Test placeholder',
    isStartLocation: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserLocation = {
      name: 'Current location',
      coordinates: [20, 10] as [number, number],
    };

    jest.requireMock('@/modules/map/MapContext').useMap = () => ({
      state: 0,
      setState: mockSetState,
      userLocation: mockUserLocation,
      setUserLocation: mockSetUserLocation,
    });
  });

  test('renders correctly with default props', () => {
    const { getByPlaceholderText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} />
      </MapProvider>
    );

    expect(getByPlaceholderText('Test placeholder')).toBeTruthy();
  });

  test('shows location name when location is provided', () => {
    const { getByDisplayValue } = render(
      <MapProvider>
        <LocationInput {...defaultProps} location={TEST_LOCATION} />
      </MapProvider>
    );

    expect(getByDisplayValue('Test Location')).toBeTruthy();
  });

  test('shows map options when input is focused with empty query', async () => {
    const { getByPlaceholderText, getByText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');

    expect(getByText('Choose on map')).toBeTruthy();
  });

  test('shows map options when query matches location name', () => {
    const { getByPlaceholderText, getByText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} location={TEST_LOCATION} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');

    expect(getByText('Choose on map')).toBeTruthy();
  });

  test('shows Use Current Location option when isStartLocation is true', () => {
    const { getByPlaceholderText, getByText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} isStartLocation={true} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');

    expect(getByText('Use Current Location')).toBeTruthy();
  });

  test('does not show Use Current Location when location name is Current location', () => {
    const { getByPlaceholderText, queryByText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} isStartLocation={true} location={CURRENT_LOCATION} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');

    expect(queryByText('Use Current Location')).toBeNull();
  });

  test('calls setState with correct MapState when Choose on map is pressed for start location', () => {
    const { getByPlaceholderText, getByText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} isStartLocation={true} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');

    fireEvent.press(getByText('Choose on map'));

    expect(mockSetState).toHaveBeenCalledWith(MapState.SelectingStartLocation);
  });

  test('calls setState with correct MapState when Choose on map is pressed for end location', () => {
    const { getByPlaceholderText, getByText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} isStartLocation={false} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');

    fireEvent.press(getByText('Choose on map'));

    expect(mockSetState).toHaveBeenCalledWith(MapState.SelectingEndLocation);
  });

  test('uses userLocation when Use Current Location is pressed', async () => {
    const { getByPlaceholderText, getByText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} isStartLocation={true} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');

    fireEvent.press(getByText('Use Current Location'));

    await waitFor(() => {
      expect(defaultProps.setLocation).toHaveBeenCalledWith(mockUserLocation);
    });
  });

  test('logs error when user location is not available', async () => {
    const originalUserLocation = mockUserLocation;
    mockUserLocation = null;

    jest.spyOn(console, 'error').mockImplementation();

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByPlaceholderText, getByText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} isStartLocation={true} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');

    if (getByText('Use Current Location')) {
      fireEvent.press(getByText('Use Current Location'));

      await waitFor(
        () => {
          expect(consoleSpy).toHaveBeenCalledWith('User location not available');
        },
        { timeout: 1000 }
      );
    }
    consoleSpy.mockRestore();
    mockUserLocation = originalUserLocation;
  });

  test('updates input value when typing', () => {
    const { getByPlaceholderText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent.changeText(input, 'Montreal');

    expect(input.props.value).toBe('Montreal');
  });

  test('shows autocomplete when input is focused and query is different from location name', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <MapProvider>
        <LocationInput {...defaultProps} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');
    fireEvent.changeText(input, 'New search');

    expect(getByTestId('locations-autocomplete')).toBeTruthy();
  });

  test('handles location selection from autocomplete', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <MapProvider>
        <LocationInput {...defaultProps} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');
    fireEvent.changeText(input, 'New search');

    const autocompleteOption = getByTestId('autocomplete-option');
    fireEvent.press(autocompleteOption);

    jest.useFakeTimers();
    jest.runAllTimers();

    expect(defaultProps.setLocation).toHaveBeenCalledWith(TEST_LOCATION);
    expect(input.props.value).toBe('Test Location');

    jest.useRealTimers();
  });

  test('updates query to match location name when input loses focus', () => {
    const { getByPlaceholderText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} location={TEST_LOCATION} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');
    fireEvent.changeText(input, 'Different text');
    fireEvent(input, 'blur');

    expect(input.props.value).toBe('Test Location');
  });

  test('handles the case when location changes via props', async () => {
    const { getByPlaceholderText, rerender } = render(
      <MapProvider>
        <LocationInput {...defaultProps} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    expect(input.props.value).toBe('');

    rerender(
      <MapProvider>
        <LocationInput {...defaultProps} location={TEST_LOCATION} />
      </MapProvider>
    );

    expect(input.props.value).toBe('Test Location');

    const DIFFERENT_LOCATION = { name: 'Different Place', coordinates: [3, 4] as [number, number] };
    rerender(
      <MapProvider>
        <LocationInput {...defaultProps} location={DIFFERENT_LOCATION} />
      </MapProvider>
    );

    expect(input.props.value).toBe('Different Place');
  });
});
