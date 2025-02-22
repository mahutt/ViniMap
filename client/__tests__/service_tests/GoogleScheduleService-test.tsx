import { extractScheduleData, fetchCalendarEvents } from '../../Services/GoogleScheduleService';

describe('extractScheduleData', () => {
  const mockCalendarData = {
    items: [
      {
        summary: 'Yoga Class',
        location: 'Studio A',
        start: {
          dateTime: '2024-02-22T09:00:00-05:00',
        },
        end: {
          dateTime: '2024-02-22T10:00:00-05:00',
        },
      },
      {
        summary: 'Meditation',
        // No location to test default case
        start: {
          dateTime: '2024-02-22T11:00:00-05:00',
        },
        end: {
          dateTime: '2024-02-22T12:00:00-05:00',
        },
      },
    ],
  };

  it('processes calendar data correctly', () => {
    // Test both string and object input in one test
    const resultFromString = extractScheduleData(JSON.stringify(mockCalendarData));
    const resultFromObject = extractScheduleData(mockCalendarData);

    expect(resultFromString).toEqual(resultFromObject);
    expect(resultFromString['2024-02-22']).toEqual([
      {
        className: 'Yoga Class',
        location: 'Studio A',
        time: expect.stringMatching(/^\d{1,2}:\d{2} [AP]M - \d{1,2}:\d{2} [AP]M$/),
      },
      {
        className: 'Meditation',
        location: 'Unknown Location',
        time: expect.stringMatching(/^\d{1,2}:\d{2} [AP]M - \d{1,2}:\d{2} [AP]M$/),
      },
    ]);
  });
});

describe('fetchCalendarEvents', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY = 'test-api-key';
  });

  it('handles successful and error cases', async () => {
    const mockData = { items: [] };
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    let result = await fetchCalendarEvents('test-calendar-id');
    expect(result).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://www.googleapis.com/calendar/v3/calendars/test-calendar-id/events?key='
      )
    );

    // Test error response
    fetchMock.mockRejectOnce(new Error('Network error'));
    result = await fetchCalendarEvents('test-calendar-id');
    expect(result).toEqual([]);

    // Test non-ok response
    fetchMock.mockResponseOnce('', { status: 404, statusText: 'Not Found' });
    result = await fetchCalendarEvents('test-calendar-id');
    expect(result).toEqual([]);
  });
});
