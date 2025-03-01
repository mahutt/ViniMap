import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LocationInput from '@/components/LocationInput';
import { MapProvider, Location, MapState } from '@/modules/map/MapContext';
import CoordinateService from '@/services/CoordinateService';

const TEST_LOCATION = { name: 'Test Location', coordinates: [1, 2] as [number, number] };
const CURRENT_LOCATION = { name: 'Current location', coordinates: [20, 10] as [number, number] };

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Make sure the mock function is properly set up for Jest
jest.mock('@/services/CoordinateService', () => ({
  getCurrentCoordinates: jest.fn().mockImplementation(() => Promise.resolve([20, 10])),
}));

// Mock the map context
const mockSetState = jest.fn();
jest.mock('@/modules/map/MapContext', () => {
  const actual = jest.requireActual('@/modules/map/MapContext');
  return {
    ...actual,
    useMap: () => ({
      setState: mockSetState,
    }),
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

  test('calls getCurrentCoordinates when Use Current Location is pressed', async () => {
    (CoordinateService.getCurrentCoordinates as jest.Mock).mockImplementation(() =>
      Promise.resolve([20, 10] as [number, number])
    );

    const { getByPlaceholderText, getByText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} isStartLocation={true} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');

    fireEvent.press(getByText('Use Current Location'));

    await waitFor(() => {
      expect(CoordinateService.getCurrentCoordinates).toHaveBeenCalled();
      expect(defaultProps.setLocation).toHaveBeenCalledWith({
        name: 'Current location',
        coordinates: [20, 10],
      });
    });
  });

  test('handles errors when getting current location', async () => {
    (CoordinateService.getCurrentCoordinates as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error('Location error'))
    );

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByPlaceholderText, getByText } = render(
      <MapProvider>
        <LocationInput {...defaultProps} isStartLocation={true} />
      </MapProvider>
    );

    const input = getByPlaceholderText('Test placeholder');
    fireEvent(input, 'focus');
    fireEvent.press(getByText('Use Current Location'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error getting current location:', expect.any(Error));
    });

    consoleSpy.mockRestore();
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
});
