import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CalendarSelectionModal from '@/components/CalendarSelectionModal';
import GoogleService from '@/services/GoogleService';

jest.mock('@/services/GoogleService', () => ({
  getUserInfoFromStorage: jest.fn(),
  getSelectedCalendarId: jest.fn(),
  fetchUserCalendars: jest.fn(),
  saveSelectedCalendarId: jest.fn(),
}));

jest.mock('react-native/Libraries/Image/Image', () => 'Image');

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('CalendarSelectionModal', () => {
  const mockProps = {
    visible: true,
    onClose: jest.fn(),
    onSelect: jest.fn(),
    onEnterCalendarId: jest.fn(),
    onSignOut: jest.fn(),
  };

  const mockUserInfo = {
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://example.com/profile.jpg',
  };

  const mockCalendars = [
    {
      id: 'calendar1',
      summary: 'Primary Calendar',
      primary: true,
    },
    {
      id: 'calendar2',
      summary: 'Work Calendar',
      description: 'My work schedule',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (GoogleService.getUserInfoFromStorage as jest.Mock).mockReturnValue(mockUserInfo);
    (GoogleService.getSelectedCalendarId as jest.Mock).mockReturnValue('calendar1');
    (GoogleService.fetchUserCalendars as jest.Mock).mockResolvedValue(mockCalendars);
  });

  it('renders user info correctly', async () => {
    const { getByText } = render(<CalendarSelectionModal {...mockProps} />);

    await waitFor(() => {
      expect(getByText('Test User')).toBeTruthy();
      expect(getByText('test@example.com')).toBeTruthy();
    });
  });

  it('renders calendar list correctly', async () => {
    const { getByText } = render(<CalendarSelectionModal {...mockProps} />);

    await waitFor(() => {
      expect(getByText('Primary Calendar (Primary)')).toBeTruthy();
      expect(getByText('Work Calendar')).toBeTruthy();
      expect(getByText('My work schedule')).toBeTruthy();
    });
  });

  it('handles calendar selection', async () => {
    const { getByText } = render(<CalendarSelectionModal {...mockProps} />);

    await waitFor(() => {
      expect(getByText('Work Calendar')).toBeTruthy();
    });

    fireEvent.press(getByText('Work Calendar'));

    expect(GoogleService.saveSelectedCalendarId).toHaveBeenCalledWith('calendar2');
    expect(mockProps.onSelect).toHaveBeenCalledWith('calendar2');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles sign out', async () => {
    const { getByText } = render(<CalendarSelectionModal {...mockProps} />);

    await waitFor(() => {
      expect(getByText('Sign Out')).toBeTruthy();
    });

    fireEvent.press(getByText('Sign Out'));

    expect(mockProps.onSignOut).toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('handles manual calendar ID entry', async () => {
    const { getByText } = render(<CalendarSelectionModal {...mockProps} />);

    await waitFor(() => {
      expect(getByText('Enter Calendar ID Manually')).toBeTruthy();
    });

    fireEvent.press(getByText('Enter Calendar ID Manually'));

    expect(mockProps.onEnterCalendarId).toHaveBeenCalled();
  });

  it('shows empty state when no calendars are available', async () => {
    (GoogleService.fetchUserCalendars as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(<CalendarSelectionModal {...mockProps} />);

    await waitFor(() => {
      expect(getByText('No calendars found')).toBeTruthy();
    });
  });

  it('handles loading error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (GoogleService.fetchUserCalendars as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<CalendarSelectionModal {...mockProps} />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it('renders user with fallback profile when no picture', async () => {
    (GoogleService.getUserInfoFromStorage as jest.Mock).mockReturnValue({
      ...mockUserInfo,
      picture: null,
    });

    const { getByText } = render(<CalendarSelectionModal {...mockProps} />);

    await waitFor(() => {
      expect(getByText('T')).toBeTruthy();
    });
  });
});
