import { render } from '@testing-library/react-native';
import CalendarScreen from '@/app/(tabs)/calendar';

describe('<CalendarScreen />', () => {
  test('CalendarScreen renders correctly', () => {
    const tree = render(<CalendarScreen />).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
