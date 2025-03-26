import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import GoogleService from '@/services/GoogleService';
import * as Google from 'expo-auth-session/providers/google';
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity, Alert } from 'react-native';
import moment from 'moment';
import SimpleModal from '@/components/CalendarIdBox';
import CalendarSelectionModal from '@/components/CalendarSelectionModal';
import { Coordinates, MapState, useMap } from '@/modules/map/MapContext';
import { Location, ScheduleData } from '@/modules/map/Types';
import { getBuildingCoordinates } from '@/services/BuildingService';
import ProfilePicture from '@/components/ProfilePicture';
import WeekPicker from '@/components/WeekPicker';
import ScheduleDisplay from '@/components/ScheduleDisplay';

export default function Calendar() {
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
        <ScheduleDisplay date={value} scheduleData={scheduleData} onClassClick={handleClassClick} />
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
});
