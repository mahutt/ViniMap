import { findNextClass, ScheduleData } from '@/services/NextClassService';

function mockDate(dateString: string) {
  const originalDate = Date;
  global.Date = jest.fn(() => new originalDate(dateString)) as any;
  return () => {
    global.Date = originalDate;
  };
}

describe('findNextClass', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns the next upcoming class on the same day', () => {
    const resetDate = mockDate('2023-05-15T10:30:00');

    const scheduleData: ScheduleData = {
      '2023-05-15': [
        { className: 'Past Class', location: 'Room A', time: '9:00 AM - 10:00 AM' },
        { className: 'Next Class', location: 'Room B', time: '11:00 AM - 12:00 PM' },
        { className: 'Later Class', location: 'Room C', time: '2:00 PM - 3:00 PM' },
      ],
    };

    const result = findNextClass(scheduleData);

    expect(result).toEqual({
      className: 'Next Class',
      location: 'Room B',
      time: '11:00 AM - 12:00 PM',
    });

    resetDate();
  });

  test('returns the first class of the next day when no more classes today', () => {
    const resetDate = mockDate('2023-05-15T18:30:00');

    const scheduleData: ScheduleData = {
      '2023-05-15': [
        { className: 'Morning Class', location: 'Room A', time: '9:00 AM - 10:00 AM' },
        { className: 'Afternoon Class', location: 'Room B', time: '2:00 PM - 3:00 PM' },
      ],
      '2023-05-16': [
        { className: 'Tomorrow Class', location: 'Room C', time: '10:00 AM - 11:00 AM' },
        { className: 'Another Tomorrow Class', location: 'Room D', time: '3:00 PM - 4:00 PM' },
      ],
    };

    const result = findNextClass(scheduleData);

    expect(result).toEqual({
      className: 'Tomorrow Class',
      location: 'Room C',
      time: '10:00 AM - 11:00 AM',
    });

    resetDate();
  });

  test('correctly handles PM time format', () => {
    const resetDate = mockDate('2023-05-15T13:30:00');

    const scheduleData: ScheduleData = {
      '2023-05-15': [
        { className: 'Morning Class', location: 'Room A', time: '10:00 AM - 11:00 AM' },
        { className: 'Noon Class', location: 'Room B', time: '12:00 PM - 1:00 PM' },
        { className: 'Afternoon Class', location: 'Room C', time: '2:00 PM - 3:00 PM' },
        { className: 'Evening Class', location: 'Room D', time: '5:30 PM - 6:30 PM' },
      ],
    };

    const result = findNextClass(scheduleData);

    expect(result).toEqual({
      className: 'Afternoon Class',
      location: 'Room C',
      time: '2:00 PM - 3:00 PM',
    });

    resetDate();
  });

  test('correctly handles 12 AM and 12 PM edge cases', () => {
    const resetDate = mockDate('2023-05-15T11:30:00');

    const scheduleData: ScheduleData = {
      '2023-05-15': [
        { className: 'Midnight Class', location: 'Room A', time: '12:00 AM - 1:00 AM' },
        { className: 'Morning Class', location: 'Room B', time: '10:00 AM - 11:00 AM' },
        { className: 'Noon Class', location: 'Room C', time: '12:00 PM - 1:00 PM' },
        { className: 'Evening Class', location: 'Room D', time: '8:00 PM - 9:00 PM' },
      ],
    };

    const result = findNextClass(scheduleData);

    expect(result).toEqual({
      className: 'Noon Class',
      location: 'Room C',
      time: '12:00 PM - 1:00 PM',
    });

    resetDate();
  });

  test('finds first class on future date when no classes today', () => {
    const resetDate = mockDate('2023-05-15T10:30:00');

    const scheduleData: ScheduleData = {
      '2023-05-14': [
        { className: 'Yesterday Class', location: 'Room A', time: '2:00 PM - 3:00 PM' },
      ],
      '2023-05-17': [{ className: 'Future Class', location: 'Room B', time: '1:00 PM - 2:00 PM' }],
      '2023-05-16': [
        { className: 'Tomorrow Class', location: 'Room C', time: '10:00 AM - 11:00 AM' },
      ],
    };

    const result = findNextClass(scheduleData);

    expect(result).toEqual({
      className: 'Tomorrow Class',
      location: 'Room C',
      time: '10:00 AM - 11:00 AM',
    });

    resetDate();
  });

  test('returns null for empty schedule data', () => {
    const scheduleData: ScheduleData = {};

    const result = findNextClass(scheduleData);

    expect(result).toBeNull();
  });

  test('returns null for null/undefined schedule data', () => {
    // @ts-ignore - Testing invalid input
    const result = findNextClass(null);

    expect(result).toBeNull();
  });

  test('handles malformed time format gracefully', () => {
    const resetDate = mockDate('2023-05-15T10:30:00');

    const scheduleData: ScheduleData = {
      '2023-05-15': [
        { className: 'Malformed Class', location: 'Room A', time: 'Invalid Time Format' },
        { className: 'Valid Class', location: 'Room B', time: '11:00 AM - 12:00 PM' },
      ],
    };

    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = findNextClass(scheduleData);

    expect(result).toEqual({
      className: 'Valid Class',
      location: 'Room B',
      time: '11:00 AM - 12:00 PM',
    });

    resetDate();
  });

  // Test error handling
  test('handles errors gracefully and returns null', () => {
    const scheduleData = 'not an object' as any;

    jest.spyOn(console, 'log').mockImplementation(() => {});

    const result = findNextClass(scheduleData);

    expect(result).toBeNull();
  });
});
