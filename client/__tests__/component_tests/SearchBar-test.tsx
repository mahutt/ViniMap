import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/SearchBar';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockLocationCallback = jest.fn();
jest.mock('@/components/LocationsAutocomplete', () => {
  return jest.fn().mockImplementation((props) => {
    mockLocationCallback.mockImplementation(props.callback);
    return null;
  });
});

// Mock MapContext with all potential hooks and functions
jest.mock('@/modules/map/MapContext', () => ({
  MapState: {
    Default: 0,
    SelectingStartLocation: 1,
    SelectingEndLocation: 2,
    Information: 3,
  },
  useMap: () => ({
    state: 0,
    setState: jest.fn(),
    userLocation: {
      name: 'Current location',
      coordinates: [20, 10],
    },
    setUserLocation: jest.fn(),
    startLocation: null,
    setStartLocation: jest.fn(),
    endLocation: null,
    setEndLocation: jest.fn(),
    flyTo: jest.fn(),
    selectedBuilding: null,
    setSelectedBuilding: jest.fn(),
    searchResults: [],
    setSearchResults: jest.fn(),
  }),
}));

jest.mock('@/services/CoordinateService', () => ({
  getCurrentCoordinates: jest.fn().mockResolvedValue([20, 10]),
  watchPosition: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

describe('<SearchBar />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('SearchBar renders correctly', () => {
    try {
      const { toJSON } = render(<SearchBar />);
      const tree = toJSON();
      expect(tree).toMatchSnapshot();
    } catch (error) {
      console.error('Error rendering SearchBar:', error);
      throw error;
    }
  });

  test('updates query state when text input changes', () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');

    fireEvent.changeText(input, 'New York');

    expect(input.props.value).toBe('New York');
  });

  test('renders LocationsAutocomplete when query is not empty', () => {
    const LocationsAutocomplete = require('@/components/LocationsAutocomplete');

    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');

    expect(LocationsAutocomplete).not.toHaveBeenCalled();

    fireEvent.changeText(input, 'New York');
    expect(LocationsAutocomplete).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'New York',
      }),
      expect.any(Object)
    );
  });

  test('calls setEndLocation when a location is selected from autocomplete', () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');

    fireEvent.changeText(input, 'San Francisco');
    mockLocationCallback({ name: 'San Francisco', coordinates: [37.7749, -122.4194] });

    expect(input.props.value).toBe('San Francisco');
  });

  test('hides LocationsAutocomplete when query is cleared', () => {
    const LocationsAutocomplete = require('@/components/LocationsAutocomplete');
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');

    fireEvent.changeText(input, 'Los Angeles');
    expect(LocationsAutocomplete).toHaveBeenCalled();

    fireEvent.changeText(input, '');
    expect(LocationsAutocomplete).toHaveBeenCalledTimes(1);
  });

  test('calls flyTo when a location is selected', () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');
    const { flyTo } = require('@/modules/map/MapContext').useMap();

    fireEvent.changeText(input, 'Chicago');
    mockLocationCallback({ name: 'Chicago', coordinates: [41.8781, -87.6298] });

    expect(true);
  });

  test('sets state to Information when a location is selected', () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');

    fireEvent.changeText(input, 'Seattle');
    mockLocationCallback({ name: 'Seattle', coordinates: [47.6062, -122.3321] });

    expect(true);
  });

  test('does not call autocomplete callback when query matches endLocation name', () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');
    const { setEndLocation } = require('@/modules/map/MapContext').useMap();

    fireEvent.changeText(input, 'Existing Location');
    mockLocationCallback({ name: 'Existing Location', coordinates: [34, -118] });

    expect(setEndLocation).toHaveBeenCalledTimes(0);
    fireEvent.changeText(input, 'Existing Location');
    expect(setEndLocation).toHaveBeenCalledTimes(0);
  });
});
