import { render, fireEvent } from '@testing-library/react-native';
import Schedule from '@/app/(tabs)/calendar';
import { storage } from '@/services/StorageService';
import { MMKV } from 'react-native-mmkv';
import { MapProvider } from '@/modules/map/MapContext';

// Mock the date to a specific value
const mockDate = new Date(2025, 1, 22);
jest.useFakeTimers();
jest.setSystemTime(mockDate);

jest.mock('@/services/CoordinateService', () => ({
  getCurrentCoordinates: jest.fn().mockResolvedValue({ latitude: 37.7749, longitude: -122.4194 }),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockSetEndLocation = jest.fn();
const mockSetState = jest.fn();
jest.mock('@/modules/map/MapContext', () => ({
  MapProvider: ({ children }: { children: React.ReactNode }) => children,
  useMap: jest.fn().mockReturnValue({
    userLocation: { latitude: 37.7749, longitude: -122.4194 },
    setUserLocation: jest.fn(),
    setEndLocation: mockSetEndLocation,
    setState: mockSetState,
  }),
  MapState: { Information: 'Information' },
}));

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock('@/services/StorageService', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  } as jest.Mocked<Partial<MMKV>>,
}));

jest.mock('@/services/GoogleScheduleService', () => ({
  extractScheduleData: jest.fn(),
  fetchCalendarEvents: jest.fn(),
}));

const mockExtractScheduleData = jest.mocked(
  require('@/services/GoogleScheduleService').extractScheduleData
);
const mockFetchCalendarEvents = jest.mocked(
  require('@/services/GoogleScheduleService').fetchCalendarEvents
);

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
    mockExtractScheduleData.mockReturnValue(mockCalendarData);
    mockFetchCalendarEvents.mockResolvedValue({});
  });

  test('renders correctly with mocked calendar data', () => {
    const { getByText } = render(
      <MapProvider>
        <Schedule />
      </MapProvider>
    );
    expect(getByText('Your Schedule')).toBeTruthy();
    expect(getByText('Upload')).toBeTruthy();
  });

  test('displays stored calendar data correctly', () => {
    const { getByText } = render(
      <MapProvider>
        <Schedule />
      </MapProvider>
    );
    expect(mockedStorage.getString).toHaveBeenCalledWith('calendarData');
    expect(getByText('Mathematics 101')).toBeTruthy();
    expect(getByText('Physics Lab')).toBeTruthy();
    expect(getByText('Room 201 - 09:00 AM - 10:30 AM')).toBeTruthy();
    expect(getByText('Science Building - 11:00 AM - 12:30 PM')).toBeTruthy();
  });

  test('handles empty calendar data gracefully', () => {
    // Mock empty storage
    mockedStorage.getString.mockReturnValue(undefined);

    const { getByText } = render(
      <MapProvider>
        <Schedule />
      </MapProvider>
    );
    expect(getByText('No classes scheduled')).toBeTruthy();
  });

  test('handles invalid JSON data', () => {
    // Mock invalid JSON in storage
    mockedStorage.getString.mockReturnValue('invalid-json');

    const { getByText } = render(
      <MapProvider>
        <Schedule />
      </MapProvider>
    );
    expect(getByText('No classes scheduled')).toBeTruthy();

    expect(mockedStorage.delete).toHaveBeenCalledWith('calendarData');
  });

  test('saves calendar data to storage when available', () => {
    render(
      <MapProvider>
        <Schedule />
      </MapProvider>
    );

    expect(mockedStorage.set).toHaveBeenCalledWith(
      'calendarData',
      JSON.stringify(mockCalendarData)
    );
  });

  test('properly formats and displays the current date', () => {
    const { getByText } = render(
      <MapProvider>
        <Schedule />
      </MapProvider>
    );

    const dateString = mockDate.toLocaleDateString('en-US', { dateStyle: 'full' });
    expect(getByText(dateString)).toBeTruthy();
  });

  test('handles upload button press', () => {
    const { getByText } = render(
      <MapProvider>
        <Schedule />
      </MapProvider>
    );

    fireEvent.press(getByText('Upload'));

    expect(getByText('Your Schedule')).toBeTruthy();
  });

  test('does not call storage.set when scheduleData is empty', () => {
    mockedStorage.getString.mockReturnValue(undefined);

    render(
      <MapProvider>
        <Schedule />
      </MapProvider>
    );

    expect(mockedStorage.set).not.toHaveBeenCalled();
  });
});
