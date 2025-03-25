import { ScheduleData, ClassItem } from '@/modules/map/Types';

// format date as YYYY-MM-DD (helper function)
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseTimeToMinutes = (timeStr: string): number => {
  try {
    const cleanTimeStr = timeStr.trim();

    let hour = 0;
    let minute = 0;
    let isPM = false;

    if (cleanTimeStr.toLowerCase().includes('am') || cleanTimeStr.toLowerCase().includes('pm')) {
      isPM = cleanTimeStr.toLowerCase().includes('pm');

      const timePart = cleanTimeStr.replace(/\s*[ap]m\s*$/i, '').trim();

      const [hourStr, minuteStr] = timePart.split(':');
      hour = parseInt(hourStr, 10);
      minute = parseInt(minuteStr || '0', 10);

      if (isPM && hour < 12) {
        hour += 12;
      } else if (!isPM && hour === 12) {
        hour = 0;
      }
    } else {
      const [hourStr, minuteStr] = cleanTimeStr.split(':');
      hour = parseInt(hourStr, 10);
      minute = parseInt(minuteStr || '0', 10);
    }

    return hour * 60 + minute;
  } catch (error) {
    console.error('Error parsing time string:', timeStr, error);
    return -1;
  }
};

export const extractStartTime = (timeRangeStr: string): string => {
  try {
    const separators = ['-', 'to', '~'];
    let startTime = timeRangeStr.trim();

    for (const separator of separators) {
      if (timeRangeStr.includes(separator)) {
        startTime = timeRangeStr.split(separator)[0].trim();
        break;
      }
    }

    return startTime;
  } catch (error) {
    console.error('Error extracting start time:', timeRangeStr, error);
    return timeRangeStr;
  }
};

// find the next class based on current date
export const findNextClass = (scheduleData: ScheduleData): ClassItem | null => {
  try {
    if (!scheduleData || typeof scheduleData !== 'object') {
      console.log('Invalid schedule data provided');
      return null;
    }

    const now = new Date();
    const currentDateStr = formatDateToYYYYMMDD(now);
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    const todayClasses = scheduleData[currentDateStr] || [];

    if (todayClasses.length > 0) {
      const upcomingClasses = todayClasses.filter((classItem) => {
        const startTime = extractStartTime(classItem.time);
        const startTimeMinutes = parseTimeToMinutes(startTime);

        return startTimeMinutes > currentTimeMinutes;
      });

      if (upcomingClasses.length > 0) {
        upcomingClasses.sort((a, b) => {
          const aStartTime = parseTimeToMinutes(extractStartTime(a.time));
          const bStartTime = parseTimeToMinutes(extractStartTime(b.time));
          return aStartTime - bStartTime;
        });

        return upcomingClasses[0];
      }
    }

    const allDates = Object.keys(scheduleData);

    const futureDates = allDates
      .filter((date) => date > currentDateStr)
      .sort((a, b) => a.localeCompare(b));

    if (futureDates.length > 0) {
      const nextDate = futureDates[0];
      const nextDayClasses = scheduleData[nextDate] || [];

      if (nextDayClasses.length > 0) {
        nextDayClasses.sort((a, b) => {
          const aStartTime = parseTimeToMinutes(extractStartTime(a.time));
          const bStartTime = parseTimeToMinutes(extractStartTime(b.time));
          return aStartTime - bStartTime;
        });

        return nextDayClasses[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Error in findNextClass:', error);
    return null;
  }
};
