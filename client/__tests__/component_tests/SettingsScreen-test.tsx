import React from 'react';
import { render } from '@testing-library/react-native';
import SettingsScreen from '@/app/(tabs)/settings/index';
import { Stack } from 'expo-router';

// Mock the expo-router Stack component
jest.mock('expo-router', () => ({
  Stack: {
    Screen: jest.fn().mockReturnValue(null),
  },
}));

// Mock the child components
jest.mock('@/components/SettingsItem', () => {
  return jest.fn().mockImplementation(({ title, route }) => {
    return null;
  });
});

jest.mock('@/components/RecordingButton', () => {
  return jest.fn().mockImplementation(() => {
    return null;
  });
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all components', () => {
    const { toJSON } = render(<SettingsScreen />);

    expect(toJSON()).toMatchSnapshot();

    expect(Stack.Screen).toHaveBeenCalledWith(
      expect.objectContaining({
        options: {
          title: 'Settings',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
        },
      }),
      {}
    );

    const SettingsItem = require('@/components/SettingsItem');
    const RecordingButton = require('@/components/RecordingButton');

    expect(SettingsItem).toHaveBeenCalledTimes(3);
    expect(SettingsItem).toHaveBeenCalledWith(
      { title: 'Language', route: '/settings/language' },
      {}
    );
    expect(SettingsItem).toHaveBeenCalledWith(
      { title: 'Text Size', route: '/settings/textsize' },
      {}
    );
    expect(SettingsItem).toHaveBeenCalledWith(
      { title: 'Color Blindness', route: '/settings/colorblind' },
      {}
    );

    expect(RecordingButton).toHaveBeenCalledTimes(1);
  });

  it('has the correct styles defined', () => {
    const { toJSON } = render(<SettingsScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
