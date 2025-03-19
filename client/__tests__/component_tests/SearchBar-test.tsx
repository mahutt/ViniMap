import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
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
  useMap: jest.fn(() => ({
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
  })),
}));

jest.mock('@/services/CoordinateService', () => ({
  getCurrentCoordinates: jest.fn().mockResolvedValue([20, 10]),
  watchPosition: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

describe('<SearchBar />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('selects all text with single click', () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');
    fireEvent(input, 'focus');
    expect(input.props.value).toBe('');
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
    fireEvent.changeText(input, 'New York');
    expect(LocationsAutocomplete).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'New York' }),
      expect.any(Object)
    );
  });

  test('does not render LocationsAutocomplete when query is empty', () => {
    const LocationsAutocomplete = require('@/components/LocationsAutocomplete');
    render(<SearchBar />);
    expect(LocationsAutocomplete).not.toHaveBeenCalled();
  });

  test('calls setEndLocation, flyTo, and setState when a location is selected', async () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');
    const { useMap } = require('@/modules/map/MapContext');
    const mockSetEndLocation = jest.fn();
    const mockFlyTo = jest.fn();
    const mockSetState = jest.fn();
    useMap.mockReturnValue({
      endLocation: null,
      setEndLocation: mockSetEndLocation,
      flyTo: mockFlyTo,
      setState: mockSetState,
    });

    fireEvent.changeText(input, 'Los Angeles');
    await waitFor(() => {
      mockLocationCallback({ name: 'Los Angeles', coordinates: [34.05, -118.25] });
    });

    expect(mockSetEndLocation).toHaveBeenCalledWith({
      name: 'Los Angeles',
      coordinates: [34.05, -118.25],
    });
    expect(mockFlyTo).toHaveBeenCalledWith([34.05, -118.25], 17);
    expect(mockSetState).toHaveBeenCalledWith(3);
  });

  test('clears query when input is deleted', () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');
    fireEvent.changeText(input, 'Toronto');
    fireEvent.changeText(input, '');
    expect(input.props.value).toBe('');
  });

  test('input loses focus on location selection after timeout', async () => {
    const { getByPlaceholderText } = render(<SearchBar />);
    const input = getByPlaceholderText('Search here');
    fireEvent.changeText(input, 'Vancouver');
    await waitFor(() => {
      mockLocationCallback({ name: 'Vancouver', coordinates: [49.28, -123.12] });
    });
  });
});
