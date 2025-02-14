export function extractScheduleData(
  jsonData: any
): Record<string, { className: string; location: string; time: string }[]> {
  const scheduleData: Record<string, { className: string; location: string; time: string }[]> = {};

  const calendarData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

  console.log(calendarData);
  calendarData.items.forEach((event: any) => {
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

export async function fetchCalendarEvents(calendarId: string): Promise<any> {
  const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY as string;

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${GOOGLE_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching calendar events: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}
