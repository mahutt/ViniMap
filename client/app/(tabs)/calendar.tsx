import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import GoogleService from '@/services/GoogleService';
import * as Google from 'expo-auth-session/providers/google';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import moment from 'moment';
import Swiper from 'react-native-swiper';
import SimpleModal from '@/components/CalendarIdBox';
import CalendarSelectionModal from '@/components/CalendarSelectionModal';
import { Coordinates, MapState, useMap } from '@/modules/map/MapContext';
import { Location, ScheduleData } from '@/modules/map/Types';
import { getBuildingCoordinates } from '@/services/BuildingService';
import ProfilePicture from '@/components/ProfilePicture';
import { Ionicons } from '@expo/vector-icons';
import NextClassButton from '@/components/NextClassButton';
import WeekPicker from '@/components/WeekPicker';

const { width } = Dimensions.get('window');

export default function Calendar() {
  const swiper = useRef<Swiper | null>(null);
  const [week, setWeek] = useState(0);
  const [value, setValue] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{ picture?: string } | null>(null);
  const router = useRouter();
  const [calendarIdModalVisible, setCalendarIdModalVisible] = useState(false);
  const [calendarSelectionModalVisible, setCalendarSelectionModalVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { setState, setEndLocation } = useMap();

  // google auth request
  const [request, response, promptAsync] = Google.useAuthRequest(GoogleService.config);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isAuthenticated = await GoogleService.isSignedIn();
        const storedUserInfo = isAuthenticated ? GoogleService.getUserInfoFromStorage() : null;

        setIsLoggedIn(isAuthenticated);
        setUserInfo(storedUserInfo);

        if (isAuthenticated) {
          const calendarId = GoogleService.getSelectedCalendarId();
          handleCalendarSelect(calendarId);
          const calendarData = GoogleService.getCalendarData();
          if (calendarData && Object.keys(calendarData).length > 0) {
            setScheduleData(calendarData);
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleGoogleLogin(access_token);
    }
  }, [response]);

  useEffect(() => {
    GoogleService.saveCalendarData(scheduleData);
  }, [scheduleData]);

  const handleCalendarSelect = async (calendarId: string): Promise<void> => {
    if (calendarId.trim() === '') return;

    try {
      const calendarJson = await GoogleService.fetchCalendarEvents(calendarId);
      const newScheduleData = GoogleService.extractScheduleData(calendarJson);

      const updatedScheduleData: Record<
        string,
        { className: string; location: string; time: string }[]
      > = {};

      Object.keys(newScheduleData).forEach((date) => {
        const momentDate = moment(date).format('YYYY-MM-DD');
        updatedScheduleData[momentDate] = newScheduleData[date];
      });

      setScheduleData(updatedScheduleData);
      GoogleService.saveCalendarData(updatedScheduleData);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  };

  const handleClassClick = (classItem: { className: string; location: string; time: string }) => {
    const buildingCoordinates: Coordinates = getBuildingCoordinates(classItem.location);
    const location: Location = {
      name: classItem.className,
      coordinates: buildingCoordinates,
      data: {
        address: classItem.location,
      },
    };
    setEndLocation(location);
    setState(MapState.Information);
    router.push('/');
  };

  const handleIconPress = () => {
    if (isLoggedIn) {
      setCalendarSelectionModalVisible(true);
    } else {
      setCalendarIdModalVisible(true);
    }
  };

  const handleManualCalendarIdEntry = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCalendarSelectionModalVisible(false);

    setTimeout(() => {
      setCalendarIdModalVisible(true);
      setIsTransitioning(false);
    }, 300);
  };

  const handleGoogleSignIn = () => {
    if (request) {
      promptAsync();
    } else {
      Alert.alert('Error', 'Cannot initialize Google Sign-In');
    }
  };

  const handleGoogleLogin = async (accessToken: string) => {
    try {
      const userData = await GoogleService.getUserInfo(accessToken);
      GoogleService.saveUserInfo(userData, accessToken);

      setIsLoggedIn(true);
      setUserInfo(userData);
      setCalendarIdModalVisible(false);

      setTimeout(() => {
        setCalendarSelectionModalVisible(true);
      }, 300);
    } catch (error) {
      console.error('Error during Google login:', error);
      Alert.alert('Login Failed', 'Could not complete the login process.');
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleService.signOut();

      setIsLoggedIn(false);
      setUserInfo(null);
      setScheduleData({});
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleCloseCalendarIdModal = () => {
    setCalendarIdModalVisible(false);
  };

  const handleCloseCalendarSelectionModal = () => {
    setCalendarSelectionModalVisible(false);
  };

  const weeks = React.useMemo(() => {
    const start = moment().startOf('week');
    return Array.from({ length: 5 }).map((_, adj) => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day');
        return {
          weekday: date.format('ddd'),
          date: date.toDate(),
        };
      });
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SimpleModal
        visible={calendarIdModalVisible}
        onClose={handleCloseCalendarIdModal}
        onSave={handleCalendarSelect}
        onGoogleSignIn={handleGoogleSignIn}
        isLoggedIn={isLoggedIn}
      />

      <CalendarSelectionModal
        visible={calendarSelectionModalVisible}
        onClose={handleCloseCalendarSelectionModal}
        onSelect={handleCalendarSelect}
        onEnterCalendarId={handleManualCalendarIdEntry}
        onSignOut={handleSignOut}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Schedule</Text>
          <TouchableOpacity style={styles.profileButton} onPress={handleIconPress}>
            <ProfilePicture isLoggedIn={isLoggedIn} userInfo={userInfo} styles={styles} />
          </TouchableOpacity>
        </View>

        <WeekPicker value={value} setValue={setValue} />

        <View style={styles.calendarItemCard}>
          <Text style={styles.subtitle}>
            {value.toLocaleDateString('en-US', { dateStyle: 'full' })}
          </Text>
          <View style={styles.scheduleContainer}>
            {scheduleData[moment(value).format('YYYY-MM-DD')]?.length > 0 ? (
              scheduleData[moment(value).format('YYYY-MM-DD')].map((item) => (
                <TouchableOpacity key={item.time} onPress={() => handleClassClick(item)}>
                  <View style={styles.scheduleBlock}>
                    <Text style={styles.className}>{item.className}</Text>
                    <Text style={styles.classDetails}>
                      {item.location} - {item.time}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noSchedule}>No classes scheduled</Text>
            )}
          </View>
          <NextClassButton scheduleData={scheduleData} onNavigateToClass={handleClassClick} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
  },
  scheduleContainer: {
    marginTop: 10,
  },
  scheduleBlock: {
    backgroundColor: '#852C3A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  classDetails: {
    fontSize: 14,
    color: '#dce6ff',
  },
  noSchedule: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  itemRow: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 20,
  },
  calendarItemCard: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#852C3A',
  },
  navButton: {
    padding: 0,
    zIndex: 10,
    height: 50,
    width: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledNavButton: {
    opacity: 0.5,
  },
});
