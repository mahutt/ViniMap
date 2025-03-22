import { HapticTab } from '@/components/HapticTab';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { Text } from 'react-native';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('HapticTab', () => {
  const renderWithNavigation = (props: BottomTabBarButtonProps) =>
    render(
      <NavigationContainer>
        <HapticTab {...props} />
      </NavigationContainer>
    );

  it('should trigger haptic feedback on iOS when pressed', () => {
    process.env.EXPO_OS = 'dif';

    const mockPressIn = jest.fn();
    const props: BottomTabBarButtonProps = {
      onPressIn: mockPressIn,
      href: undefined,
      children: <Text>Tab Button</Text>,
    };

    const { getByText } = renderWithNavigation(props);
    const button = getByText('Tab Button');

    fireEvent.press(button);
    expect(mockPressIn).not.toHaveBeenCalled();
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });
});
