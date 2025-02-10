import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/SearchBar';
import { MapProvider } from '@/modules/map/MapContext';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('<SearchBar />', () => {
  test('SearchBar renders correctly', () => {
    const tree = render(
      <MapProvider>
        <SearchBar />
      </MapProvider>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
