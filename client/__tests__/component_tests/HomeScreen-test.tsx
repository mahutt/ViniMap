import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import HomeScreen from '@/app/(tabs)/index';
import { useMap, MapState } from '@/modules/map/MapContext';

// Mock the MapContext hook
jest.mock('@/modules/map/MapContext', () => ({
  useMap: jest.fn(),
  MapState: {
    Idle: 'idle',
    Information: 'information',
    RoutePlanning: 'routePlanning',
  },
}));

const createMockComponent = (name: string): React.FC => {
  interface MockComponentProps {}

  const MockComponent: React.FC<MockComponentProps> = () => (
    <View>
      <Text>{name}</Text>
    </View>
  );

  MockComponent.displayName = name;
  return MockComponent;
};

// Mock the components
jest.mock('@/components/SearchBar', () => ({
  SearchBar: createMockComponent('SearchBar'),
}));

jest.mock('@/modules/map/MapView', () => createMockComponent('MapView'));
jest.mock('@/modules/map/PitchButton', () => createMockComponent('PitchButton'));
jest.mock('@/components/ui/IconCenterLocation', () =>
  createMockComponent('CenterLocationComponent')
);
jest.mock('@/components/LocationInfo', () => ({
  LocationInfo: createMockComponent('LocationInfo'),
}));
jest.mock('@/components/RoutePlanner', () => ({
  RoutePlanner: createMockComponent('RoutePlanner'),
}));
jest.mock('@/components/ui/ToggleCampusButton', () => createMockComponent('ToggleCampusButton'));
jest.mock('@/components/MapHint', () => createMockComponent('MapHint'));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders MapView in all states', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.Idle,
    });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('MapView')).toBeTruthy();
  });

  it('renders SearchBar, PitchButton, and ToggleCampusButton in Idle state', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.Idle,
    });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('SearchBar')).toBeTruthy();
    expect(getByText('PitchButton')).toBeTruthy();
    expect(getByText('ToggleCampusButton')).toBeTruthy();
  });

  it('renders CenterLocationComponent in Idle state', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.Idle,
    });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('CenterLocationComponent')).toBeTruthy();
  });

  it('renders SearchBar, PitchButton, ToggleCampusButton, and LocationInfo in Information state', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.Information,
    });

    const { getByText, queryByText } = render(<HomeScreen />);
    expect(getByText('SearchBar')).toBeTruthy();
    expect(getByText('PitchButton')).toBeTruthy();
    expect(getByText('ToggleCampusButton')).toBeTruthy();
    expect(getByText('LocationInfo')).toBeTruthy();
    expect(queryByText('CenterLocationComponent')).toBeNull();
  });

  it('renders RoutePlanner in RoutePlanning state', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.RoutePlanning,
    });

    const { getByText, queryByText } = render(<HomeScreen />);
    expect(getByText('RoutePlanner')).toBeTruthy();
    expect(queryByText('SearchBar')).toBeNull();
    expect(queryByText('PitchButton')).toBeNull();
    expect(queryByText('ToggleCampusButton')).toBeNull();
    expect(queryByText('CenterLocationComponent')).toBeNull();
  });

  it('renders MapHint in all states', () => {
    (useMap as jest.Mock).mockReturnValue({
      state: MapState.Idle,
    });

    const { getByText, rerender } = render(<HomeScreen />);
    expect(getByText('MapHint')).toBeTruthy();

    (useMap as jest.Mock).mockReturnValue({
      state: MapState.Information,
    });
    rerender(<HomeScreen />);
    expect(getByText('MapHint')).toBeTruthy();

    (useMap as jest.Mock).mockReturnValue({
      state: MapState.RoutePlanning,
    });
    rerender(<HomeScreen />);
    expect(getByText('MapHint')).toBeTruthy();
  });
});
