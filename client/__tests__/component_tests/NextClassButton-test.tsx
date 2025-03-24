import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import NextClassButton from '@/components/NextClassButton';
import { findNextClass } from '@/services/NextClassService';

// Mock the dependencies
jest.mock('@/services/NextClassService', () => ({
  findNextClass: jest.fn(),
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('NextClassButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <NextClassButton scheduleData={{}} onNavigateToClass={jest.fn()} />
    );

    expect(getByText('Go to Next Class')).toBeTruthy();
  });

  it('calls onNavigateToClass when next class is found', () => {
    const mockNextClass = {
      className: 'Test Class',
      location: 'Room 101',
      time: '10:00 AM - 11:00 AM',
    };

    (findNextClass as jest.Mock).mockReturnValue(mockNextClass);

    const mockNavigateToClass = jest.fn();
    const mockScheduleData = { '2023-05-15': [] };

    const { getByText } = render(
      <NextClassButton scheduleData={mockScheduleData} onNavigateToClass={mockNavigateToClass} />
    );

    fireEvent.press(getByText('Go to Next Class'));

    expect(findNextClass).toHaveBeenCalledWith(mockScheduleData);

    expect(mockNavigateToClass).toHaveBeenCalledWith(mockNextClass);

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('shows alert when no schedule data is provided', () => {
    const { getByText } = render(
      <NextClassButton scheduleData={null as any} onNavigateToClass={jest.fn()} />
    );

    fireEvent.press(getByText('Go to Next Class'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'No Schedule Data',
      'Please load your class schedule first.'
    );

    expect(findNextClass).not.toHaveBeenCalled();
  });

  it('shows alert when no classes are found', () => {
    (findNextClass as jest.Mock).mockReturnValue(null);

    const mockNavigateToClass = jest.fn();
    const mockScheduleData = { '2023-05-15': [] };

    const { getByText } = render(
      <NextClassButton scheduleData={mockScheduleData} onNavigateToClass={mockNavigateToClass} />
    );

    fireEvent.press(getByText('Go to Next Class'));

    expect(Alert.alert).toHaveBeenCalledWith('No Classes', 'There are no classes scheduled.');

    expect(mockNavigateToClass).not.toHaveBeenCalled();
  });

  it('shows error alert when an exception occurs', () => {
    (findNextClass as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    const mockNavigateToClass = jest.fn();
    const mockScheduleData = { '2023-05-15': [] };

    const { getByText } = render(
      <NextClassButton scheduleData={mockScheduleData} onNavigateToClass={mockNavigateToClass} />
    );

    fireEvent.press(getByText('Go to Next Class'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Something went wrong while finding your class. Please try again.'
    );

    expect(mockNavigateToClass).not.toHaveBeenCalled();
  });
});
