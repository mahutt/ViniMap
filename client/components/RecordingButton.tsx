import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import RNUxcam from 'react-native-ux-cam';

interface RecordingButtonProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({ isRecording, setIsRecording }) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: isRecording ? '#FF3B30' : '#007AFF' }]}
      onPress={() => {
        if (isRecording) {
          console.log('Stopping UXCam session...');
          RNUxcam.stopSessionAndUploadData();
          console.log('UXCam session stopped and upload requested');
          setIsRecording(false);
        } else {
          console.log('Starting new UXCam session...');
          RNUxcam.startNewSession();
          console.log('UXCam session started');
          setIsRecording(true);
        }
      }}>
      <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
    </TouchableOpacity>
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
});

export default RecordingButton;
