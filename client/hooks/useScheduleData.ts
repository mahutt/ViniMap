import { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import GoogleService from '@/services/GoogleService';
import { ScheduleData } from '@/modules/map/Types';

export const useScheduleData = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const authStatus = await GoogleService.isSignedIn();
        setIsAuthenticated(authStatus);

        const calendarData = GoogleService.getCalendarData();
        if (calendarData && Object.keys(calendarData).length > 0) {
          setScheduleData(calendarData);
          GoogleService.saveCalendarData(calendarData);
        }
      } catch (error) {
        console.error('Error checking auth and loading schedule data:', error);
      }
    };

    checkAuthAndLoadData();
  }, []);

  const fetchCalendarEvents = useCallback(async (calendarId: string): Promise<void> => {
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
  }, []);

  const clearScheduleData = useCallback(() => {
    setScheduleData({});
    GoogleService.saveCalendarData({});
  }, []);

  const updateAuthStatus = useCallback(
    (status: boolean) => {
      setIsAuthenticated(status);
      if (!status) {
        clearScheduleData();
      }
    },
    [clearScheduleData]
  );

  return {
    scheduleData,
    fetchCalendarEvents,
    clearScheduleData,
    updateAuthStatus,
    isAuthenticated,
  };
};
