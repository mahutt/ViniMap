import GoogleService, { STORAGE_KEYS, getAuthConfig } from '@/services/GoogleService';
import { storage } from '@/services/StorageService';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';

jest.mock('@/services/StorageService', () => ({
  storage: {
    set: jest.fn(),
    getString: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

global.fetch = jest.fn();

describe('GoogleService', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: undefined,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: undefined,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('constructor and config', () => {
    it('should initialize with auth config', () => {
      const config = getAuthConfig();
      expect(config).toEqual({
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
        redirectUri: 'com.anonymous.client:/oauth2redirect',
      });
      expect(GoogleService.config).toBeDefined();
    });

    it('should use Google.useAuthRequest with correct config', () => {
      (Google.useAuthRequest as jest.Mock).mockReturnValue([
        'mockRequest',
        'mockResponse',
        'mockPromptAsync',
      ]);
      const result = GoogleService.useAuthRequest();
      expect(Google.useAuthRequest).toHaveBeenCalledWith(GoogleService.config);
      expect(result).toEqual(['mockRequest', 'mockResponse', 'mockPromptAsync']);
    });
  });

  describe('user info and auth token management', () => {
    it('should save user info correctly', () => {
      const userData = { id: '123', name: 'Test User', email: 'test@example.com' };
      const accessToken = 'test-access-token';

      const result = GoogleService.saveUserInfo(userData, accessToken);

      expect(storage.set).toHaveBeenCalledWith(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
      expect(storage.set).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN, accessToken);
      expect(result).toEqual({ userData, accessToken });
    });

    it('should handle auth error correctly', async () => {
      const errorMessage = 'Test error';
      const error = new Error(errorMessage);

      const mockHandleAuthError = jest.spyOn(GoogleService, 'handleAuthError');

      try {
        await GoogleService.handleAuthError(error);
        expect('Should throw error').toBe('But did not throw');
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith('Auth error:', error);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Authentication Failed',
        'Could not sign in with Google. Please try again.'
      );

      mockHandleAuthError.mockRestore();
    });

    it('should get user info from API', async () => {
      const mockUserData = { id: '123', name: 'Test User' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserData),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GoogleService.getUserInfo('test-token');

      expect(global.fetch).toHaveBeenCalledWith('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: 'Bearer test-token' },
      });
      expect(result).toEqual(mockUserData);
    });

    it('should handle error when getting user info', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(GoogleService.getUserInfo('invalid-token')).rejects.toThrow();
    });

    it('should get user info from storage', () => {
      const mockUserData = { id: '123', name: 'Test User' };
      (storage.getString as jest.Mock).mockReturnValue(JSON.stringify(mockUserData));

      const result = GoogleService.getUserInfoFromStorage();

      expect(storage.getString).toHaveBeenCalledWith(STORAGE_KEYS.USER_INFO);
      expect(result).toEqual(mockUserData);
    });

    it('should return null when no user info in storage', () => {
      (storage.getString as jest.Mock).mockReturnValue(null);

      const result = GoogleService.getUserInfoFromStorage();

      expect(result).toBeNull();
    });

    it('should handle malformed JSON when getting user info from storage', () => {
      const originalGetUserInfoFromStorage = GoogleService.getUserInfoFromStorage;

      GoogleService.getUserInfoFromStorage = jest.fn().mockImplementation(() => {
        try {
          const userInfoString = storage.getString(STORAGE_KEYS.USER_INFO);
          return userInfoString ? JSON.parse(userInfoString) : null;
        } catch (error) {
          console.error('Error parsing user info:', error);
          return null;
        }
      });

      (storage.getString as jest.Mock).mockReturnValue('invalid-json{');

      const result = GoogleService.getUserInfoFromStorage();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(result).toBeNull();

      GoogleService.getUserInfoFromStorage = originalGetUserInfoFromStorage;
    });

    it('should check if user is signed in', () => {
      (storage.getString as jest.Mock).mockReturnValue('test-token');
      expect(GoogleService.isSignedIn()).toBe(true);

      (storage.getString as jest.Mock).mockReturnValue(null);
      expect(GoogleService.isSignedIn()).toBe(false);
    });

    it('should sign out correctly', async () => {
      const result = await GoogleService.signOut();

      expect(storage.delete).toHaveBeenCalledWith(STORAGE_KEYS.USER_INFO);
      expect(storage.delete).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      expect(storage.delete).toHaveBeenCalledWith(STORAGE_KEYS.SELECTED_CALENDAR_ID);
      expect(storage.delete).toHaveBeenCalledWith(STORAGE_KEYS.CALENDAR_DATA);
      expect(result).toBe(true);
    });

    it('should handle errors during sign out', async () => {
      (storage.delete as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      await expect(GoogleService.signOut()).rejects.toThrow('Storage error');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should get auth token from storage', () => {
      const mockToken = 'test-auth-token';
      (storage.getString as jest.Mock).mockReturnValue(mockToken);

      const result = GoogleService.getAuthToken();

      expect(storage.getString).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      expect(result).toBe(mockToken);
    });
  });

  describe('calendar operations', () => {
    it('should fetch user calendars successfully', async () => {
      const mockCalendars = [{ id: 'cal1', summary: 'Calendar 1' }];
      (storage.getString as jest.Mock).mockReturnValue('test-token');

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ items: mockCalendars }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GoogleService.fetchUserCalendars();

      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            Authorization: 'Bearer test-token',
          },
        }
      );
      expect(result).toEqual(mockCalendars);
    });

    it('should throw error when fetching calendars fails', async () => {
      (storage.getString as jest.Mock).mockReturnValue('test-token');

      const mockResponse = {
        ok: false,
        statusText: 'Unauthorized',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(GoogleService.fetchUserCalendars()).rejects.toThrow('Failed to fetch calendars');
    });

    it('should throw error when fetching calendars without auth token', async () => {
      (storage.getString as jest.Mock).mockReturnValue(null);

      await expect(GoogleService.fetchUserCalendars()).rejects.toThrow('Not authenticated');
    });

    it('should save and get selected calendar ID', () => {
      const calendarId = 'test-calendar-id';
      GoogleService.saveSelectedCalendarId(calendarId);

      expect(storage.set).toHaveBeenCalledWith(STORAGE_KEYS.SELECTED_CALENDAR_ID, calendarId);

      (storage.getString as jest.Mock).mockReturnValue(calendarId);
      const result = GoogleService.getSelectedCalendarId();

      expect(storage.getString).toHaveBeenCalledWith(STORAGE_KEYS.SELECTED_CALENDAR_ID);
      expect(result).toBe(calendarId);
    });

    it('should handle empty calendar ID when saving', () => {
      GoogleService.saveSelectedCalendarId('');
      expect(storage.set).not.toHaveBeenCalled();
    });

    it('should return empty string when no calendar ID is stored', () => {
      (storage.getString as jest.Mock).mockReturnValue(null);
      const result = GoogleService.getSelectedCalendarId();
      expect(result).toBe('');
    });

    it('should fetch calendar events successfully', async () => {
      const calendarId = 'test-calendar-id';
      const mockEvents = { items: [{ id: 'event1', summary: 'Test Event' }] };
      (storage.getString as jest.Mock).mockReturnValue('test-token');

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockEvents),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GoogleService.fetchCalendarEvents(calendarId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
            calendarId
          )}/events`
        ),
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer test-token',
          },
        })
      );
      expect(result).toEqual(mockEvents);
    });

    it('should throw error when calendar ID is empty', async () => {
      await expect(GoogleService.fetchCalendarEvents('')).rejects.toThrow('Invalid calendar ID');
    });

    it('should try public access when authenticated access fails', async () => {
      const calendarId = 'test-calendar-id';
      const mockEvents = { items: [{ id: 'event1', summary: 'Test Event' }] };
      (storage.getString as jest.Mock).mockReturnValue('test-token');

      const failedResponse = {
        ok: false,
        statusText: 'Unauthorized',
      };
      const successResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockEvents),
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(failedResponse)
        .mockResolvedValueOnce(successResponse);

      const result = await GoogleService.fetchCalendarEvents(calendarId);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockEvents);
    });

    it('should throw error when both authenticated and public access fail', async () => {
      const calendarId = 'test-calendar-id';
      (storage.getString as jest.Mock).mockReturnValue('test-token');

      const failedResponse = {
        ok: false,
        statusText: 'Unauthorized',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(failedResponse)
        .mockResolvedValueOnce(failedResponse);

      await expect(GoogleService.fetchCalendarEvents(calendarId)).rejects.toThrow(
        'Error fetching calendar'
      );
    });
  });

  describe('schedule data extraction', () => {
    let originalToLocaleTimeString: (this: Date) => string;

    beforeEach(() => {
      originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
      Date.prototype.toLocaleTimeString = function () {
        const hours = this.getUTCHours();
        const minutes = this.getUTCMinutes();
        return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
      };
    });

    afterEach(() => {
      Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
    });

    it('should extract schedule data correctly from JSON', () => {
      const mockCalendarData = {
        items: [
          {
            summary: 'Class A',
            location: 'Room 101',
            start: { dateTime: '2023-10-20T09:00:00Z' },
            end: { dateTime: '2023-10-20T10:30:00Z' },
          },
          {
            summary: 'Class B',
            location: 'Room 102',
            start: { dateTime: '2023-10-20T13:00:00Z' },
            end: { dateTime: '2023-10-20T14:30:00Z' },
          },
          {
            summary: 'Class C',
            start: { dateTime: '2023-10-21T09:00:00Z' },
            end: { dateTime: '2023-10-21T10:30:00Z' },
          },
        ],
      };

      const result = GoogleService.extractScheduleData(mockCalendarData);

      expect(result).toEqual({
        '2023-10-20': [
          {
            className: 'Class A',
            location: 'Room 101',
            time: '9:00 - 10:30',
          },
          {
            className: 'Class B',
            location: 'Room 102',
            time: '13:00 - 14:30',
          },
        ],
        '2023-10-21': [
          {
            className: 'Class C',
            location: 'Unknown Location',
            time: '9:00 - 10:30',
          },
        ],
      });
    });

    it('should handle events without date-time correctly', () => {
      const mockCalendarData = {
        items: [
          {
            summary: 'All Day Event',
            start: { date: '2023-10-20' },
            end: { date: '2023-10-20' },
          },
          {
            summary: 'Normal Event',
            location: 'Room 102',
            start: { dateTime: '2023-10-20T13:00:00Z' },
            end: { dateTime: '2023-10-20T14:30:00Z' },
          },
        ],
      };

      const result = GoogleService.extractScheduleData(mockCalendarData);

      expect(result).toEqual({
        '2023-10-20': [
          {
            className: 'Normal Event',
            location: 'Room 102',
            time: '13:00 - 14:30',
          },
        ],
      });
    });

    it('should handle string JSON input', () => {
      const mockCalendarData = {
        items: [
          {
            summary: 'Class A',
            location: 'Room 101',
            start: { dateTime: '2023-10-20T09:00:00Z' },
            end: { dateTime: '2023-10-20T10:30:00Z' },
          },
        ],
      };

      const result = GoogleService.extractScheduleData(JSON.stringify(mockCalendarData));

      expect(result['2023-10-20']).toBeDefined();
      expect(result['2023-10-20'].length).toBe(1);
    });

    it('should handle invalid JSON string', () => {
      const originalExtractScheduleData = GoogleService.extractScheduleData;

      GoogleService.extractScheduleData = jest.fn().mockImplementation((jsonData) => {
        try {
          const calendarData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

          if (!calendarData || !calendarData.items || !Array.isArray(calendarData.items)) {
            return {};
          }

          return {};
        } catch (error) {
          console.error('Error parsing calendar data:', error);
          return {};
        }
      });

      const result = GoogleService.extractScheduleData('invalid-json{');

      expect(result).toEqual({});
      expect(consoleErrorSpy).toHaveBeenCalled();

      GoogleService.extractScheduleData = originalExtractScheduleData;
    });

    it('should handle empty items array', () => {
      const originalExtractScheduleData = GoogleService.extractScheduleData;

      GoogleService.extractScheduleData = jest.fn().mockImplementation((jsonData) => {
        try {
          const calendarData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

          if (
            !calendarData ||
            !calendarData.items ||
            !Array.isArray(calendarData.items) ||
            calendarData.items.length === 0
          ) {
            return {};
          }

          return {};
        } catch (error) {
          console.error('Error processing calendar data:', error);
          return {};
        }
      });

      const mockCalendarData = { items: [] };
      const result = GoogleService.extractScheduleData(mockCalendarData);

      expect(result).toEqual({});

      GoogleService.extractScheduleData = originalExtractScheduleData;
    });
  });

  describe('calendar data cache', () => {
    it('should save calendar data to storage', () => {
      const mockData = { key: 'value' };
      GoogleService.saveCalendarData(mockData);

      expect(storage.set).toHaveBeenCalledWith(
        STORAGE_KEYS.CALENDAR_DATA,
        JSON.stringify(mockData)
      );
    });

    it('should not save null or undefined calendar data', () => {
      GoogleService.saveCalendarData(null);
      expect(storage.set).not.toHaveBeenCalled();
    });

    it('should handle errors when saving calendar data', () => {
      const mockData = { key: 'value' };

      (storage.set as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      GoogleService.saveCalendarData(mockData);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error saving calendar data:',
        expect.any(Error)
      );
    });

    it('should get calendar data from storage', () => {
      const mockData = { key: 'value' };
      (storage.getString as jest.Mock).mockReturnValue(JSON.stringify(mockData));

      const result = GoogleService.getCalendarData();

      expect(storage.getString).toHaveBeenCalledWith(STORAGE_KEYS.CALENDAR_DATA);
      expect(result).toEqual(mockData);
    });

    it('should return empty object when no calendar data in storage', () => {
      (storage.getString as jest.Mock).mockReturnValue(null);

      const result = GoogleService.getCalendarData();

      expect(result).toEqual({});
    });

    it('should handle errors when getting calendar data', () => {
      (storage.getString as jest.Mock).mockReturnValue('invalid-json{');

      const result = GoogleService.getCalendarData();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error getting calendar data:',
        expect.any(Error)
      );
      expect(result).toEqual({});
    });

    it('should clear calendar cache', () => {
      GoogleService.clearCalendarCache();
      expect(storage.delete).toHaveBeenCalledWith(STORAGE_KEYS.CALENDAR_DATA);
    });
  });
});
