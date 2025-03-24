import { ScheduleData, ClassItem } from '@/modules/map/Types';

// format date as YYYY-MM-DD (helper function)
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const todayClasses = scheduleData[currentDateStr] || [];

    if (todayClasses.length > 0) {
      const currentTimeMinutes = currentHour * 60 + currentMinute;

      const upcomingClasses = todayClasses.filter((classItem) => {
        try {
          const startTimePart = classItem.time.split('-')[0].trim();
          const [timePart, ampm] = startTimePart.split(' ');
          const [hourStr, minuteStr] = timePart.split(':');

          let hour = parseInt(hourStr, 10);
          const minute = parseInt(minuteStr, 10);

          if (ampm && ampm.toLowerCase() === 'pm' && hour < 12) {
            hour += 12;
          } else if (ampm && ampm.toLowerCase() === 'am' && hour === 12) {
            hour = 0;
          }

          const classStartTimeMinutes = hour * 60 + minute;
          return classStartTimeMinutes > currentTimeMinutes;
        } catch {
          return true;
        }
      });

      if (upcomingClasses.length > 0) {
        upcomingClasses.sort((a, b) => {
          try {
            const getTimeMinutes = (timeStr: string) => {
              const startTimePart = timeStr.split('-')[0].trim();
              const [timePart, ampm] = startTimePart.split(' ');
              const [hourStr, minuteStr] = timePart.split(':');

              let hour = parseInt(hourStr, 10);
              const minute = parseInt(minuteStr, 10);

              if (ampm && ampm.toLowerCase() === 'pm' && hour < 12) {
                hour += 12;
              } else if (ampm && ampm.toLowerCase() === 'am' && hour === 12) {
                hour = 0;
              }

              return hour * 60 + minute;
            };

            return getTimeMinutes(a.time) - getTimeMinutes(b.time);
          } catch {
            return 0;
          }
        });

        return upcomingClasses[0];
      }
    }

    const futureDates = Object.keys(scheduleData)
      .filter((date) => date > currentDateStr)
      .sort((a, b) => a.localeCompare(b));

    if (futureDates.length > 0) {
      const nextDate = futureDates[0];
      const nextDayClasses = scheduleData[nextDate] || [];

      if (nextDayClasses.length > 0) {
        return nextDayClasses[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Error in findNextClass:', error);
    return null;
  }
};
