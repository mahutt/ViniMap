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
});
