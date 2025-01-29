import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/SearchBar';

// Mock the @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('<SearchBar />', () => {
  test('SearchBar renders correctly', () => {
    const tree = render(<SearchBar onSearch={(query) => {}} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('calls onSearch when text changes', () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(<SearchBar onSearch={mockOnSearch} />);

    const input = getByPlaceholderText('Search here');
    fireEvent.changeText(input, 'test query');

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });
});
