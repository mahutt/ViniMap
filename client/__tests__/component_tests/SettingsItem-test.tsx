import React from 'react';
import { render } from '@testing-library/react-native';
import { Pressable } from 'react-native';
import SettingsItem from '@/components/SettingsItem';

// Mock the expo-router Link component
jest.mock('expo-router', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => children,
}));

// Mock the Ionicons component
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'IconMock',
}));

describe('SettingsItem', () => {
  const props = {
    title: 'Test Title',
    route: '/test-route',
  };

  it('renders correctly with all props', () => {
    const { getByText, toJSON } = render(<SettingsItem {...props} />);

    expect(getByText('Test Title')).toBeTruthy();

    expect(toJSON()).toMatchSnapshot();
  });

  it('handles pressed state styling', () => {
    const { UNSAFE_getByType } = render(<SettingsItem {...props} />);

    const pressable = UNSAFE_getByType(Pressable);

    const regularStyle = pressable.props.style({ pressed: false });
    const pressedStyle = pressable.props.style({ pressed: true });

    expect(regularStyle).not.toEqual(pressedStyle);

    expect(pressedStyle.find((style: any) => style && style.opacity === 0.7)).toBeTruthy();
  });
});
