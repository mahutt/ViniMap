import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RecordingButton from '@/components/RecordingButton';
import { useUXCam } from '@/usability/UXCamContext';

// Mock the UXCamContext hook
jest.mock('@/usability/UXCamContext', () => ({
  useUXCam: jest.fn(),
}));

const mockedUseUXCam = useUXCam as jest.MockedFunction<typeof useUXCam>;

describe('RecordingButton Component', () => {
  describe('ActionButton', () => {
    it('renders correctly with given props', () => {
      mockedUseUXCam.mockReturnValue({
        isRecording: false,
        startRecording: jest.fn(),
        stopRecording: jest.fn(),
      });

      const { getByText } = render(<RecordingButton />);

      const button = getByText('Start Recording (Usability test)');
      expect(button).toBeTruthy();
    });
  });

  // Test for RecordingButton when not recording
  describe('RecordingButton when not recording', () => {
    beforeEach(() => {
      // Mock the UXCam hook for the not recording state
      const startRecording = jest.fn();
      mockedUseUXCam.mockReturnValue({
        isRecording: false,
        startRecording,
        stopRecording: jest.fn(),
      });
    });

    it('renders the Start Recording button when not recording', () => {
      const { getByText } = render(<RecordingButton />);
      expect(getByText('Start Recording (Usability test)')).toBeTruthy();
    });

    it('calls startRecording when Start Recording button is pressed', () => {
      const { getByText } = render(<RecordingButton />);
      const startButton = getByText('Start Recording (Usability test)');

      fireEvent.press(startButton);

      const { startRecording } = mockedUseUXCam();
      expect(startRecording).toHaveBeenCalledTimes(1);
    });
  });

  // Test for RecordingButton when recording
  describe('RecordingButton when recording', () => {
    beforeEach(() => {
      // Mock the UXCam hook for the recording state
      const stopRecording = jest.fn();
      mockedUseUXCam.mockReturnValue({
        isRecording: true,
        startRecording: jest.fn(),
        stopRecording,
      });
    });

    it('renders the Stop Recording button when recording', () => {
      const { getByText } = render(<RecordingButton />);
      expect(getByText('Stop Recording (Usability test)')).toBeTruthy();
    });

    it('calls stopRecording when Stop Recording button is pressed', () => {
      const { getByText } = render(<RecordingButton />);
      const stopButton = getByText('Stop Recording (Usability test)');

      fireEvent.press(stopButton);

      const { stopRecording } = mockedUseUXCam();
      expect(stopRecording).toHaveBeenCalledTimes(1);
    });
  });

  // Test for styling
  describe('Component styling', () => {
    it('applies the correct styles for Start Recording button', () => {
      mockedUseUXCam.mockReturnValue({
        isRecording: false,
        startRecording: jest.fn(),
        stopRecording: jest.fn(),
      });

      const { getByText } = render(<RecordingButton />);
      const startButton = getByText('Start Recording (Usability test)');

      expect(startButton).toBeTruthy();
    });

    it('applies the correct styles for Stop Recording button', () => {
      mockedUseUXCam.mockReturnValue({
        isRecording: true,
        startRecording: jest.fn(),
        stopRecording: jest.fn(),
      });

      const { getByText } = render(<RecordingButton />);
      const stopButton = getByText('Stop Recording (Usability test)');

      expect(stopButton).toBeTruthy();
    });
  });

  // Test for snapshot testing
  it('matches snapshot when not recording', () => {
    mockedUseUXCam.mockReturnValue({
      isRecording: false,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
    });

    const { toJSON } = render(<RecordingButton />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot when recording', () => {
    mockedUseUXCam.mockReturnValue({
      isRecording: true,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
    });

    const { toJSON } = render(<RecordingButton />);
    expect(toJSON()).toMatchSnapshot();
  });
});
