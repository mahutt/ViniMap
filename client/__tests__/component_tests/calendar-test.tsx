import { render } from '@testing-library/react-native';
import Calendar from '@/app/(tabs)/calendar';
import { storage } from '@/services/StorageService';
import { MMKV } from 'react-native-mmkv';
import { MapProvider } from '@/modules/map/MapContext';
import GoogleService from '@/services/GoogleService';

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

jest.mock('@/services/GoogleService', () => ({
  config: {
    iosClientId: 'mock-ios-client-id',
    androidClientId: 'mock-android-client-id',
    scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
  },
  isSignedIn: jest.fn().mockResolvedValue(false),
  getUserInfoFromStorage: jest.fn().mockReturnValue(null),
  getCalendarData: jest.fn().mockReturnValue({}),
  saveCalendarData: jest.fn(),
  fetchCalendarEvents: jest.fn(),
  extractScheduleData: jest.fn(),
  getUserInfo: jest.fn(),
  saveUserInfo: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn().mockReturnValue([
    { type: 'success' }, // mock request
    { type: null }, // mock response
    jest.fn(), // mock promptAsync
  ]),
}));

jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(),
  FontDisplay: {
    FALLBACK: 'fallback',
  },
  __internal__: {
    addFontManagerKey: jest.fn(),
    getNativeFontName: jest.fn(),
  },
  _loaded: {},
  loadedFonts: new Set(),
  loadedNativeFonts: new Map(),
}));

jest.mock('@/components/CalendarIdBox', () => {
  const MockSimpleModal = ({
    onClose,
    onSave,
    onGoogleSignIn,
  }: {
    onClose: () => void;
    onSave: (id: string) => void;
    onGoogleSignIn: () => void;
  }) => (
    <div data-testid="calendar-id-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onSave('test-calendar-id')}>Save</button>
      <button onClick={onGoogleSignIn}>Sign In</button>
    </div>
  );
  return MockSimpleModal;
});

jest.mock('@/components/CalendarSelectionModal', () => {
  const MockCalendarSelectionModal = ({
    onClose,
    onSelect,
    onEnterCalendarId,
    onSignOut,
  }: {
    onClose: () => void;
    onSelect: (id: string) => void;
    onEnterCalendarId: () => void;
    onSignOut: () => void;
  }) => (
    <div data-testid="calendar-selection-modal">
      <button onClick={onClose}>Close</button>
      <button onClick={() => onSelect('test-calendar-id')}>Select</button>
      <button onClick={onEnterCalendarId}>Enter ID</button>
      <button onClick={onSignOut}>Sign Out</button>
    </div>
  );
  return MockCalendarSelectionModal;
});

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

describe('<Calendar />', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations for storage
    mockedStorage.getString.mockReturnValue(JSON.stringify(mockCalendarData));
    mockedStorage.set.mockClear();
    mockedStorage.delete.mockClear();

    // Reset GoogleService mocks
    (GoogleService.getCalendarData as jest.Mock).mockReturnValue(mockCalendarData);
    (GoogleService.isSignedIn as jest.Mock).mockResolvedValue(false);
    (GoogleService.extractScheduleData as jest.Mock).mockReturnValue(mockCalendarData);
    (GoogleService.fetchCalendarEvents as jest.Mock).mockResolvedValue({});
  });

  test('properly formats and displays the current date', () => {
    const { getByText } = render(
      <MapProvider>
        <Calendar />
      </MapProvider>
    );

    const dateString = mockDate.toLocaleDateString('en-US', { dateStyle: 'full' });
    expect(getByText(dateString)).toBeTruthy();
  });

  test('does not call storage.set when scheduleData is empty', () => {
    mockedStorage.getString.mockReturnValue(undefined);

    render(
      <MapProvider>
        <Calendar />
      </MapProvider>
    );

    expect(mockedStorage.set).not.toHaveBeenCalled();
  });
});
