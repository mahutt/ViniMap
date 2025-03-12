import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import GoogleAuthService from '@/services/GoogleService';

interface CalendarItem {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  selected?: boolean;
}

interface CalendarSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (calendarId: string) => void;
  onEnterCalendarId: () => void;
  onSignOut: () => void;
}

const CalendarSelectionModal: React.FC<CalendarSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  onEnterCalendarId,
  onSignOut,
}) => {
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);

  const userInfo = GoogleAuthService.getUserInfoFromStorage();
  const selectedCalendarId = GoogleAuthService.getSelectedCalendarId();

  useEffect(() => {
    if (userInfo) {
      loadCalendars();
    }
  }, [userInfo]);

  const loadCalendars = async () => {
    try {
      const calendarList = await GoogleAuthService.fetchUserCalendars();
      const calendarItems: CalendarItem[] = calendarList.map((calendar: any) => ({
        ...calendar,
        selected: calendar.id === selectedCalendarId,
      }));
      setCalendars(calendarItems);
    } catch (error) {
      console.error('Failed to load calendars:', error);
      Alert.alert('Error', 'Failed to load your calendars. Please try again.');
    }
  };

  const handleSelectCalendar = (calendarId: string) => {
    GoogleAuthService.saveSelectedCalendarId(calendarId);
    onSelect(calendarId);
    onClose();
  };

  const handleSignOut = () => {
    onSignOut();
    onClose();
  };

  return (
    <Modal transparent={true} visible={visible}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              {userInfo && (
                <View style={styles.userInfoContainer}>
                  {userInfo.picture ? (
                    <Image source={{ uri: userInfo.picture }} style={styles.profileImage} />
                  ) : (
                    <View style={[styles.profileFallback, { backgroundColor: '#6A8CAF' }]}>
                      <Text style={styles.profileInitial}>
                        {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.userName}>{userInfo.name}</Text>
                  <Text style={styles.userEmail}>{userInfo.email}</Text>
                </View>
              )}

              <Text style={styles.sectionTitle}>Your Calendars</Text>

              <>
                {calendars.length === 0 ? (
                  <Text style={styles.infoText}>No calendars found</Text>
                ) : (
                  <FlatList
                    data={calendars}
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.calendarItem}
                        onPress={() => handleSelectCalendar(item.id)}>
                        <View style={styles.calendarItemContent}>
                          <View style={styles.checkboxContainer}>
                            {item.selected && (
                              <View style={styles.checkbox}>
                                <Text style={styles.checkmark}>✓</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.calendarTextContainer}>
                            <Text style={styles.calendarName}>
                              {item.summary} {item.primary ? '(Primary)' : ''}
                            </Text>
                            {item.description && (
                              <Text style={styles.calendarDescription}>{item.description}</Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </>

              <View style={styles.footerButtons}>
                <TouchableOpacity style={styles.footerButton} onPress={onEnterCalendarId}>
                  <Text style={styles.footerButtonText}>Enter Calendar ID Manually</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    padding: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  userInfoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  profileFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
  list: {
    maxHeight: 300,
  },
  calendarItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  calendarItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#852C3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  calendarTextContainer: {
    flex: 1,
  },
  calendarName: {
    fontSize: 16,
    fontWeight: '500',
  },
  calendarDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  footerButtons: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
  },
  footerButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  footerButtonText: {
    color: '#852C3A',
    fontWeight: '500',
  },
  signOutButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
});

export default CalendarSelectionModal;
