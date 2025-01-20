import { render } from '@testing-library/react-native';
import { ThemedText } from '@/components/ThemedText';

describe('<ThemedText />', () => {
  test('CustomText renders correctly', () => {
    const tree = render(<ThemedText>Some text</ThemedText>).toJSON();

    expect(tree).toMatchSnapshot();
    expect(true).toBe(false);
  });
});
