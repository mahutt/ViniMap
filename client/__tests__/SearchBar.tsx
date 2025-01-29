import { render } from '@testing-library/react-native';
import { SearchBar } from '@/components/SearchBar';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('<SearchBar />', () => {
  test('SearchBar renders correctly', () => {
    const tree = render(<SearchBar onSearch={(query) => {}} />).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
