import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ScheduleDisplay from '@/components/ScheduleDisplay';
import moment from 'moment';

jest.mock('@/components/NextClassButton', () => {
  return jest.fn(
    ({
      scheduleData,
      onNavigateToClass,
    }: {
      scheduleData: Record<string, any[]>;
      onNavigateToClass: (classData: any) => void;
    }) => {
      const MockButton = require('react-native').TouchableOpacity;
      return (
        <MockButton
          testID="next-class-button"
          onPress={() => {
            if (Object.values(scheduleData)[0]?.length > 0) {
              onNavigateToClass(Object.values(scheduleData)[0]?.[0]);
            }
          }}
        />
      );
    }
  );
});

describe('ScheduleDisplay', () => {
  const mockDate = new Date('2023-09-15');
  const formattedSelectedDate = moment(mockDate).format('YYYY-MM-DD');

  const mockScheduleData = {
    [formattedSelectedDate]: [
      {
        className: 'Math 101',
        location: 'Room 203',
        time: '09:00 AM - 10:30 AM',
        building: 'Science Building',
        floor: 2,
        roomNumber: '203',
      },
      {
        className: 'History 202',
        location: 'Room 105',
        time: '11:00 AM - 12:30 PM',
        building: 'Humanities Building',
        floor: 1,
        roomNumber: '105',
      },
    ],
    '2023-09-16': [
      {
        className: 'Biology 200',
        location: 'Lab 302',
        time: '13:00 PM - 15:30 PM',
        building: 'Science Building',
        floor: 3,
        roomNumber: '302',
      },
    ],
  };

  const mockOnClassClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onClassClick when a class item is pressed', () => {
    const { getByText } = render(
      <ScheduleDisplay
        date={mockDate}
        scheduleData={mockScheduleData}
        onClassClick={mockOnClassClick}
      />
    );

    fireEvent.press(getByText('Math 101'));

    expect(mockOnClassClick).toHaveBeenCalledTimes(1);
    expect(mockOnClassClick).toHaveBeenCalledWith(mockScheduleData[formattedSelectedDate][0]);

    fireEvent.press(getByText('History 202'));

    expect(mockOnClassClick).toHaveBeenCalledTimes(2);
    expect(mockOnClassClick).toHaveBeenCalledWith(mockScheduleData[formattedSelectedDate][1]);
  });

  it('renders the NextClassButton component', () => {
    const { getByTestId } = render(
      <ScheduleDisplay
        date={mockDate}
        scheduleData={mockScheduleData}
        onClassClick={mockOnClassClick}
      />
    );

    const nextClassButton = getByTestId('next-class-button');
    expect(nextClassButton).toBeTruthy();

    fireEvent.press(nextClassButton);

    expect(mockOnClassClick).toHaveBeenCalledTimes(1);
    expect(mockOnClassClick).toHaveBeenCalledWith(mockScheduleData[formattedSelectedDate][0]);
  });

  it('handles empty scheduleData object', () => {
    const { getByText } = render(
      <ScheduleDisplay date={mockDate} scheduleData={{}} onClassClick={mockOnClassClick} />
    );

    expect(getByText('No classes scheduled')).toBeTruthy();
  });
});
