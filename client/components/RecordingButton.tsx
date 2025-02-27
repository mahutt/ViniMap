import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useUXCam } from '@/usability/UXCamContext';

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
  const { isRecording, startRecording, stopRecording } = useUXCam();

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
