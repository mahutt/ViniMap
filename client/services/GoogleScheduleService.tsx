// import { storage } from './StorageService';

// const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY as string;

// export function extractScheduleData(
//   jsonData: any
// ): Record<string, { className: string; location: string; time: string }[]> {
//   const scheduleData: Record<string, { className: string; location: string; time: string }[]> = {};

//   const calendarData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

//   calendarData.items.forEach((event: any) => {
//     if (!event.start?.dateTime || !event.end?.dateTime) return;

//     const date = event.start.dateTime.split('T')[0];
//     const startTime = new Date(event.start.dateTime).toLocaleTimeString('en-US', {
//       hour: 'numeric',
//       minute: '2-digit',
//     });
//     const endTime = new Date(event.end.dateTime).toLocaleTimeString('en-US', {
//       hour: 'numeric',
//       minute: '2-digit',
//     });

//     const formattedEvent = {
//       className: event.summary,
//       location: event.location || 'Unknown Location',
//       time: `${startTime} - ${endTime}`,
//     };

//     if (!scheduleData[date]) {
//       scheduleData[date] = [];
//     }

//     scheduleData[date].push(formattedEvent);
//   });

//   return scheduleData;
// }

// export async function fetchCalendarEvents(calendarId: string): Promise<any> {
//   if (!calendarId || calendarId.trim() === '') {
//     console.error('Invalid calendar ID');
//     throw new Error('Invalid calendar ID');
//   }
//   const accessToken = storage.getString('googleAccessToken');

//   if (accessToken) {
//     const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
//       calendarId
//     )}/events?key=${GOOGLE_API_KEY}`;
//     const response = await fetch(url, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });
//     if (response.ok) {
//       return await response.json();
//     }
//   }

//   const publicUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
//     calendarId
//   )}/events?key=${GOOGLE_API_KEY}&showDeleted=false&singleEvents=true&maxResults=100&orderBy=startTime&timeMin=${new Date().toISOString()}`;

//   const publicResponse = await fetch(publicUrl);

//   if (!publicResponse.ok) {
//     if (publicResponse.status === 404) {
//       throw new Error('Calendar not found or not public');
//     } else if (publicResponse.status === 403) {
//       throw new Error('Calendar exists but is not publicly accessible');
//     } else {
//       throw new Error(`Error fetching calendar: ${publicResponse.statusText}`);
//     }
//   }
// }

// export function clearCalendarCache() {
//   storage.delete('calendarData');
// }

// export function saveCalendarData(data: any) {
//   if (!data) return;
//   try {
//     storage.set('calendarData', JSON.stringify(data));
//   } catch (error) {
//     console.error('Error saving calendar data:', error);
//   }
// }

// export function getCalendarData() {
//   try {
//     const data = storage.getString('calendarData');
//     if (!data) return {};
//     return JSON.parse(data);
//   } catch (error) {
//     console.error('Error getting calendar data:', error);
//     return {};
//   }
// }
