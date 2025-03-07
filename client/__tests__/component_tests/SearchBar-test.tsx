import React from 'react';
import { render } from '@testing-library/react-native';
import { SearchBar } from '@/components/SearchBar';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock MapContext with all potential hooks and functions
jest.mock('@/modules/map/MapContext', () => {
  return {
    MapProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
    MapState: {
      Default: 0,
      SelectingStartLocation: 1,
      SelectingEndLocation: 2,
    },
  };
});

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
});
