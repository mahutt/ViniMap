import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileModal from '@/components/ProfileModal';

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

describe('ProfileModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnSignOut = jest.fn();

  const mockUserProfile = {
    photoUrl: 'https://example.com/photo.jpg',
    name: 'John Doe',
    email: 'john.doe@example.com',
    calendars: ['Calendar 1', 'Calendar 2', 'Work Calendar'],
  };

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    userProfile: mockUserProfile,
    onSave: mockOnSave,
    onSignOut: mockOnSignOut,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('matches the snapshot', () => {
    const { toJSON } = render(<ProfileModal {...defaultProps} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders correctly with user profile data', () => {
    const { getByText, getByPlaceholderText } = render(<ProfileModal {...defaultProps} />);

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('john.doe@example.com')).toBeTruthy();

    expect(getByText('Calendar 1')).toBeTruthy();
    expect(getByText('Calendar 2')).toBeTruthy();
    expect(getByText('Work Calendar')).toBeTruthy();

    expect(getByPlaceholderText('Enter calendar ID')).toBeTruthy();
    expect(getByText('Add Calendar')).toBeTruthy();
    expect(getByText('Sign Out')).toBeTruthy();
  });

  it('handles calendar selection correctly', () => {
    const { getByText } = render(<ProfileModal {...defaultProps} />);

    const calendarItem = getByText('Work Calendar');
    fireEvent.press(calendarItem);

    expect(mockOnSave).toHaveBeenCalledWith('Work Calendar');
  });

  it('handles adding a new calendar correctly', () => {
    const { getByText, getByPlaceholderText } = render(<ProfileModal {...defaultProps} />);

    const input = getByPlaceholderText('Enter calendar ID');
    const addButton = getByText('Add Calendar');

    fireEvent.changeText(input, 'New Calendar');
    fireEvent.press(addButton);

    expect(mockOnSave).toHaveBeenCalledWith('New Calendar');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles sign out correctly', () => {
    const { getByText } = render(<ProfileModal {...defaultProps} />);

    const signOutButton = getByText('Sign Out');
    fireEvent.press(signOutButton);

    expect(mockOnSignOut).toHaveBeenCalledTimes(1);
  });

  it('handles close button correctly', () => {
    const { getByTestId } = render(<ProfileModal {...defaultProps} />);

    // You might need to add a testID to your close button in the component
    // For example: <TouchableOpacity testID="close-button" onPress={onClose}>
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when visible prop is false', () => {
    const { queryByText } = render(<ProfileModal {...defaultProps} visible={false} />);

    expect(queryByText('Your Profile')).toBeNull();
  });
});
