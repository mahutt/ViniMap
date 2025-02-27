import React, { useCallback, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import RNUxcam from 'react-native-ux-cam';

interface ActionButtonProps {
  onPress: () => void;
  buttonStyle: object;
  label: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onPress, buttonStyle, label }) => (
  <TouchableOpacity style={[styles.button, buttonStyle]} onPress={onPress}>
    <Text style={styles.buttonText}>{label}</Text>
  </TouchableOpacity>
);

const RecordingButton: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);

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

  return isRecording ? (
    <ActionButton
      onPress={stopRecording}
      buttonStyle={styles.stopButton}
      label="Stop Recording (Usability test)"
    />
  ) : (
    <ActionButton
      onPress={startRecording}
      buttonStyle={styles.startButton}
      label="Start Recording (Usability test)"
    />
  );
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
