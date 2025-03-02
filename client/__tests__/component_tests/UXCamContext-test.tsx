import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { UXCamProvider, useUXCam } from '@/usability/UXCamContext';

// Mock react-native-ux-cam before importing
jest.mock('react-native-ux-cam', () => ({
  optIntoSchematicRecordings: jest.fn(),
  startWithConfiguration: jest.fn(),
  tagScreenName: jest.fn(),
  startNewSession: jest.fn(),
  stopSessionAndUploadData: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  usePathname: jest.fn().mockReturnValue('/test-path'),
}));

import RNUxcam from 'react-native-ux-cam';

function TestComponent() {
  const uxcam = useUXCam();

  return (
    <>
      <Text testID="recording-status">Recording: {uxcam.isRecording ? 'Yes' : 'No'}</Text>
      <Text testID="start-button" onPress={uxcam.startRecording}>
        Start Recording
      </Text>
      <Text testID="stop-button" onPress={uxcam.stopRecording}>
        Stop Recording
      </Text>
    </>
  );
}

describe('UXCamProvider and useUXCam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('startRecording starts a new UXCam session', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const { getByTestId } = render(
      <UXCamProvider>
        <TestComponent />
      </UXCamProvider>
    );

    expect(getByTestId('recording-status').props.children).toEqual(['Recording: ', 'No']);

    fireEvent.press(getByTestId('start-button'));

    expect(RNUxcam.startNewSession).toHaveBeenCalled();
    expect(getByTestId('recording-status').props.children).toEqual(['Recording: ', 'Yes']);
    expect(consoleSpy).toHaveBeenCalledWith('Starting new UXCam session...');
    expect(consoleSpy).toHaveBeenCalledWith('UXCam session started');

    consoleSpy.mockRestore();
  });

  test('stopRecording stops the UXCam session and uploads data', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const { getByTestId } = render(
      <UXCamProvider>
        <TestComponent />
      </UXCamProvider>
    );

    fireEvent.press(getByTestId('start-button'));
    fireEvent.press(getByTestId('stop-button'));
    expect(RNUxcam.stopSessionAndUploadData).toHaveBeenCalled();
    expect(getByTestId('recording-status').props.children).toEqual(['Recording: ', 'No']);
    expect(consoleSpy).toHaveBeenCalledWith('Stopping UXCam session...');
    expect(consoleSpy).toHaveBeenCalledWith('UXCam session stopped and upload requested');

    consoleSpy.mockRestore();
  });

  test('useUXCam throws error when used outside of UXCamProvider', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUXCam must be used within an UXCamProvider');

    errorSpy.mockRestore();
  });
});
