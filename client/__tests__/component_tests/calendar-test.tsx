import { render } from '@testing-library/react-native';
import Schedule from '@/app/(tabs)/calendar';
import { storage } from '@/Services/StorageService';
import { MMKV } from 'react-native-mmkv';

// Mock the date to a specific value
const mockDate = new Date(2025, 1, 22);
jest.useFakeTimers();
jest.setSystemTime(mockDate);

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('@/Services/StorageService', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  } as jest.Mocked<Partial<MMKV>>,
}));

jest.mock('@/Services/GoogleScheduleService', () => ({
  extractScheduleData: jest.fn(),
  fetchCalendarEvents: jest.fn(),
}));

// Sample calendar data
const mockCalendarData = {
  '2025-02-22': [
    {
      className: 'Mathematics 101',
      location: 'Room 201',
      time: '09:00 AM - 10:30 AM',
    },
    {
      className: 'Physics Lab',
      location: 'Science Building',
      time: '11:00 AM - 12:30 PM',
    },
  ],
  '2025-02-23': [
    {
      className: 'Computer Science',
      location: 'Tech Lab',
      time: '14:00 PM - 15:30 PM',
    },
  ],
};

const mockedStorage = storage as jest.Mocked<MMKV>;

describe('<Schedule />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedStorage.getString.mockReturnValue(JSON.stringify(mockCalendarData));
  });

  test('renders correctly with mocked calendar data', () => {
    const { getByText } = render(<Schedule />);
    expect(getByText('Your Schedule')).toBeTruthy();
    expect(getByText('Upload')).toBeTruthy();
  });

  test('displays stored calendar data correctly', () => {
    const { getByText } = render(<Schedule />);
    expect(mockedStorage.getString).toHaveBeenCalledWith('calendarData');
    expect(getByText('Mathematics 101')).toBeTruthy();
    expect(getByText('Physics Lab')).toBeTruthy();
  });

  test('handles empty calendar data gracefully', () => {
    // Mock empty storage
    mockedStorage.getString.mockReturnValue(undefined);

    const { getByText } = render(<Schedule />);
    expect(getByText('No classes scheduled')).toBeTruthy();
  });

  test('handles invalid JSON data', () => {
    // Mock invalid JSON in storage
    mockedStorage.getString.mockReturnValue('invalid-json');

    const { getByText } = render(<Schedule />);
    expect(getByText('No classes scheduled')).toBeTruthy();

    // Verify that storage.delete was called to clean up invalid data
    expect(mockedStorage.delete).toHaveBeenCalledWith('calendarData');
  });
});
