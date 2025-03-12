import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface SimpleModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (calendarId: string) => void;
  onGoogleSignIn: () => void;
  isLoggedIn: boolean;
}

const SimpleModal: React.FC<SimpleModalProps> = ({
  visible,
  onClose,
  onSave,
  onGoogleSignIn,
  isLoggedIn,
}) => {
  const [calendarId, setCalendarId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    onSave(calendarId.trim());
    setCalendarId('');
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent} testID="modal-content">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Calendar</Text>
            <TouchableOpacity onPress={onClose} testID="close-button">
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {!isLoggedIn && (
            <>
              <TouchableOpacity style={styles.googleSignInButton} onPress={onGoogleSignIn}>
                <Feather name="user" size={18} color="#fff" />
                <Text style={styles.googleSignInText}>Sign in with Google</Text>
              </TouchableOpacity>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
            </>
          )}
          <Text style={styles.inputLabel}>Enter Calendar ID</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="e.g. abc123@group.calendar.google.com"
            value={calendarId}
            onChangeText={setCalendarId}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity
            style={[styles.saveButton, calendarId.trim() === '' && styles.disabledButton]}
            onPress={handleSave}
            disabled={calendarId.trim() === ''}
            testID="save-button">
            <Text style={styles.saveButtonText}>Add Calendar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#852C3A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  googleSignInButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  googleSignInText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#666',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default SimpleModal;
