import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: {
    photoUrl: string;
    name: string;
    email: string;
    calendars: string[];
  };
  onSave: (calendarId: string) => void;
  onSignOut: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  userProfile,
  onSave,
  onSignOut,
}) => {
  const [calendarId, setCalendarId] = useState('');

  const handleSave = () => {
    onSave(calendarId);
    setCalendarId('');
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Profile</Text>
            <TouchableOpacity testID="close-button" onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <Image source={{ uri: userProfile.photoUrl }} style={styles.profileImage} />
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
          </View>

          <View style={styles.calendarSection}>
            <Text style={styles.sectionTitle}>Your Calendars</Text>
            <FlatList
              data={userProfile.calendars}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.calendarItem} onPress={() => onSave(item)}>
                  <Feather name="calendar" size={16} color="#852C3A" />
                  <Text style={styles.calendarItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.calendarList}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Add Calendar ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter calendar ID"
              value={calendarId}
              onChangeText={setCalendarId}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={calendarId.trim() === ''}>
              <Text style={styles.saveButtonText}>Add Calendar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
            <Feather name="log-out" size={16} color="#fff" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
  },
  calendarSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  calendarList: {
    maxHeight: 120,
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  calendarItemText: {
    marginLeft: 10,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },
  inputSection: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#852C3A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileModal;
