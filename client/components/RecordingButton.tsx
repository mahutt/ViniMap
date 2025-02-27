import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import RNUxcam from 'react-native-ux-cam';

interface RecordingButtonProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({ isRecording, setIsRecording }) => {
  const startRecording = useCallback(() => {
    console.log('Starting new UXCam session...');
    RNUxcam.startNewSession();
    console.log('UXCam session started');
    setIsRecording(true);
  }, [setIsRecording]);

  const stopRecording = useCallback(() => {
    console.log('Stopping UXCam session...');
    RNUxcam.stopSessionAndUploadData();
    console.log('UXCam session stopped and upload requested');
    setIsRecording(false);
  }, [setIsRecording]);

  const StartRecordingButton = () => (
    <TouchableOpacity style={[styles.button, styles.startButton]} onPress={startRecording}>
      <Text style={styles.buttonText}>Start Recording (Usability test)</Text>
    </TouchableOpacity>
  );

  const StopRecordingButton = () => (
    <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopRecording}>
      <Text style={styles.buttonText}>Stop Recording (Usability test)</Text>
    </TouchableOpacity>
  );

  return isRecording ? <StopRecordingButton /> : <StartRecordingButton />;
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
});

export default RecordingButton;
