import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SimpleModal from '@/components/CalendarIdBox';

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

describe('SimpleModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnGoogleSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login and calendar input fields correctly', () => {
    const { getByTestId, getByText, getByPlaceholderText, queryByText } = render(
      <SimpleModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onGoogleSignIn={mockOnGoogleSignIn}
        isLoggedIn={false}
      />
    );

    expect(getByTestId('modal-content')).toBeTruthy();

    expect(getByText('Sign in with Google')).toBeTruthy();
    expect(getByText('OR')).toBeTruthy();

    expect(getByText('Enter Calendar ID')).toBeTruthy();
    expect(getByPlaceholderText('e.g. abc123@group.calendar.google.com')).toBeTruthy();

    const { queryByText: loggedInQuery } = render(
      <SimpleModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onGoogleSignIn={mockOnGoogleSignIn}
        isLoggedIn={true}
      />
    );
    expect(loggedInQuery('Sign in with Google')).toBeNull();
    expect(loggedInQuery('OR')).toBeNull();
  });

  it('handles Google Sign In button press', () => {
    const { getByText } = render(
      <SimpleModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onGoogleSignIn={mockOnGoogleSignIn}
        isLoggedIn={false}
      />
    );

    fireEvent.press(getByText('Sign in with Google'));
    expect(mockOnGoogleSignIn).toHaveBeenCalledTimes(1);
  });

  it('handles close button press', () => {
    const { getByTestId } = render(
      <SimpleModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onGoogleSignIn={mockOnGoogleSignIn}
        isLoggedIn={false}
      />
    );

    fireEvent.press(getByTestId('close-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('handles text input changes', () => {
    const { getByPlaceholderText } = render(
      <SimpleModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onGoogleSignIn={mockOnGoogleSignIn}
        isLoggedIn={false}
      />
    );

    const input = getByPlaceholderText('e.g. abc123@group.calendar.google.com');
    const calendarId = 'test@group.calendar.google.com';
    fireEvent.changeText(input, calendarId);
    expect(input.props.value).toBe(calendarId);
  });

  it('has save button initially disabled', () => {
    const { getByTestId } = render(
      <SimpleModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onGoogleSignIn={mockOnGoogleSignIn}
        isLoggedIn={false}
      />
    );

    fireEvent.press(getByTestId('save-button'));
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('enables save button after input and handles save action', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <SimpleModal
        visible={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        onGoogleSignIn={mockOnGoogleSignIn}
        isLoggedIn={false}
      />
    );

    const input = getByPlaceholderText('e.g. abc123@group.calendar.google.com');
    const calendarId = 'test@group.calendar.google.com';
    fireEvent.changeText(input, calendarId);

    fireEvent.press(getByTestId('save-button'));
    expect(mockOnSave).toHaveBeenCalledWith(calendarId);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
