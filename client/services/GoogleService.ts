import { storage } from './StorageService';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Position, Location } from '@/types';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY as string;

export const STORAGE_KEYS = {
  SELECTED_CALENDAR_ID: 'selected_calendar_id',
  USER_INFO: 'google_user_info',
  AUTH_TOKEN: 'google_auth_token',
  CALENDAR_DATA: 'calendar_data',
};

// auth configuration
export const getAuthConfig = () => {
  return {
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID as string,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID as string,
    scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
    redirectUri: 'com.anonymous.client:/oauth2redirect',
  };
};

export const useGoogleAuth = () => {
  return Google.useAuthRequest(getAuthConfig());
};

class GoogleService {
  config: any;

  constructor() {
    this.config = getAuthConfig();
  }

  saveUserInfo(userData: any, accessToken: string) {
    storage.set(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
    storage.set(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    return { userData, accessToken };
  }

  handleAuthError(error: any) {
    console.error('Auth error:', error);
    Alert.alert('Authentication Failed', 'Could not sign in with Google. Please try again.');
    throw error;
  }

  async getUserInfo(accessToken: string) {
    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  async signOut() {
    try {
      storage.delete(STORAGE_KEYS.USER_INFO);
      storage.delete(STORAGE_KEYS.AUTH_TOKEN);
      storage.delete(STORAGE_KEYS.SELECTED_CALENDAR_ID);
      storage.delete(STORAGE_KEYS.CALENDAR_DATA);
      return true;
    } catch (error) {
      this.handleAuthError(error);
      return false;
    }
  }

  isSignedIn() {
    return !!this.getAuthToken();
  }

  getAuthToken() {
    return storage.getString(STORAGE_KEYS.AUTH_TOKEN);
  }

  getUserInfoFromStorage() {
    const userInfoString = storage.getString(STORAGE_KEYS.USER_INFO);
    return userInfoString ? JSON.parse(userInfoString) : null;
  }

  async fetchUserCalendars() {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch calendars: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items;
    } catch (error: any) {
      throw new Error(`Error fetching calendars: ${error.message}`);
    }
  }

  saveSelectedCalendarId(calendarId: string) {
    if (!calendarId || calendarId.trim() === '') {
      return;
    }

    storage.set(STORAGE_KEYS.SELECTED_CALENDAR_ID, calendarId.trim());
  }

  getSelectedCalendarId() {
    const calendarId = storage.getString(STORAGE_KEYS.SELECTED_CALENDAR_ID) ?? '';
    return calendarId.trim();
  }

  extractScheduleData(
    jsonData: any
  ): Record<string, { className: string; location: string; time: string }[]> {
    const scheduleData: Record<string, { className: string; location: string; time: string }[]> =
      {};

    const calendarData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    calendarData.items.forEach((event: any) => {
      if (!event.start?.dateTime || !event.end?.dateTime) return;

      const date = event.start.dateTime.split('T')[0];
      const startTime = new Date(event.start.dateTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      const endTime = new Date(event.end.dateTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      const formattedEvent = {
        className: event.summary,
        location: event.location || 'Unknown Location',
        time: `${startTime} - ${endTime}`,
      };

      if (!scheduleData[date]) {
        scheduleData[date] = [];
      }

      scheduleData[date].push(formattedEvent);
    });

    return scheduleData;
  }

  async fetchCalendarEvents(calendarId: string): Promise<any> {
    if (!calendarId || calendarId.trim() === '') {
      console.error('Invalid calendar ID');
      throw new Error('Invalid calendar ID');
    }

    const accessToken = this.getAuthToken();

    if (accessToken) {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId
      )}/events?key=${GOOGLE_API_KEY}&showDeleted=false&singleEvents=true&maxResults=100&orderBy=startTime`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        return await response.json();
      }
    }

    const publicUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?key=${GOOGLE_API_KEY}&showDeleted=false&singleEvents=true&maxResults=100&orderBy=startTime`;

    const publicResponse = await fetch(publicUrl);

    if (!publicResponse.ok) {
      if (publicResponse.status === 404) {
        throw new Error('Calendar not found or not public');
      } else if (publicResponse.status === 403) {
        throw new Error('Calendar exists but is not publicly accessible');
      } else {
        throw new Error(`Error fetching calendar: ${publicResponse.statusText}`);
      }
    }

    return await publicResponse.json();
  }

  clearCalendarCache() {
    storage.delete(STORAGE_KEYS.CALENDAR_DATA);
  }

  saveCalendarData(data: any) {
    if (!data) return;
    try {
      storage.set(STORAGE_KEYS.CALENDAR_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving calendar data:', error);
    }
  }

  getCalendarData() {
    try {
      const data = storage.getString(STORAGE_KEYS.CALENDAR_DATA);
      if (!data) return {};
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting calendar data:', error);
      return {};
    }
  }

  async findPlace(query: string, bias: Position): Promise<Location | null> {
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json';

    const params = new URLSearchParams({
      fields: 'formatted_address,name,rating,opening_hours,geometry',
      input: query,
      inputtype: 'textquery',
      locationbias: `circle:2000@${bias[1]},${bias[0]}`,
      key: GOOGLE_API_KEY,
    });

    const response = await fetch(`${baseUrl}?${params}`);
    const options = (await response.json()).candidates;
    if (!options || options.length === 0) {
      return null;
    }
    const place = options[0];
    const location: Location = {
      name: place.name,
      coordinates: [place.geometry.location.lng, place.geometry.location.lat],
      data: {
        addr: place.formatted_address,
        rating: place.rating,
        opening_hours: place.opening_hours,
      },
    };
    return location;
  }
}

export default new GoogleService();
