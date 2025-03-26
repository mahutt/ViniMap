import React from 'react';
import { useScheduleData } from '@/hooks/useScheduleData';
import GoogleService from '@/services/GoogleService';

jest.mock('@/services/GoogleService', () => ({
  isSignedIn: jest.fn().mockResolvedValue(true),
  getCalendarData: jest.fn(),
  saveCalendarData: jest.fn(),
  fetchCalendarEvents: jest.fn(),
  extractScheduleData: jest.fn(),
}));

const mockState: Record<number, any> = {};
const mockCallbacks: Record<number, Function> = {};
let mockEffectCallback: (() => void | Promise<void>) | null = null;

jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useState: jest.fn((initialState) => {
      const key = Object.keys(mockState).length;
      if (mockState[key] === undefined) {
        mockState[key] = initialState;
      }
      return [
        mockState[key],
        (newValue: React.SetStateAction<any>) => {
          mockState[key] = typeof newValue === 'function' ? newValue(mockState[key]) : newValue;
        },
      ] as [any, React.Dispatch<React.SetStateAction<any>>];
    }),
    useEffect: jest.fn((callback, deps) => {
      mockEffectCallback = callback;
    }),
    useCallback: jest.fn((callback, deps) => {
      const key = Object.keys(mockCallbacks).length;
      mockCallbacks[key] = callback;
      return callback;
    }),
  };
});

const resetMocks = () => {
  jest.clearAllMocks();
  Object.keys(mockState).forEach((key) => delete mockState[Number(key)]);
  Object.keys(mockCallbacks).forEach((key) => delete mockCallbacks[Number(key)]);
  mockEffectCallback = null;
};

describe('useScheduleData', () => {
  beforeEach(() => {
    resetMocks();

    (GoogleService.getCalendarData as jest.Mock).mockReturnValue({});
    (GoogleService.saveCalendarData as jest.Mock).mockImplementation(() => {});
    (GoogleService.fetchCalendarEvents as jest.Mock).mockResolvedValue({});
    (GoogleService.extractScheduleData as jest.Mock).mockReturnValue({});
  });

  test('should not fetch calendar events if calendarId is empty', async () => {
    const hookResult = useScheduleData();

    if (mockEffectCallback) {
      await mockEffectCallback();
    }

    await hookResult.fetchCalendarEvents('  ');

    expect(GoogleService.fetchCalendarEvents).not.toHaveBeenCalled();
  });

  test('should clear schedule data', async () => {
    const hookResult = useScheduleData();

    if (mockEffectCallback) {
      await mockEffectCallback();
    }

    hookResult.clearScheduleData();

    expect(hookResult.scheduleData).toEqual({});
    expect(GoogleService.saveCalendarData).toHaveBeenCalledWith({});
  });

  test('should update auth status and clear data if logged out', async () => {
    const hookResult = useScheduleData();

    if (mockEffectCallback) {
      await mockEffectCallback();
    }

    hookResult.updateAuthStatus(false);

    expect(hookResult.isAuthenticated).toBe(false);
    expect(hookResult.scheduleData).toEqual({});
    expect(GoogleService.saveCalendarData).toHaveBeenCalledWith({});
  });

  test('should handle errors when fetching calendar events', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const testError = new Error('API error');
    (GoogleService.fetchCalendarEvents as jest.Mock).mockRejectedValue(testError);

    const hookResult = useScheduleData();

    if (mockEffectCallback) {
      await mockEffectCallback();
    }

    await hookResult.fetchCalendarEvents('test-calendar-id');

    expect(console.error).toHaveBeenCalledWith('Error fetching calendar events:', testError);
    expect(hookResult.scheduleData).toEqual({});
    console.error = originalConsoleError;
  });
});
