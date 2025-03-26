import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import moment from 'moment';
import { ScheduleData, ClassItem } from '@/modules/map/Types';
import NextClassButton from '@/components/NextClassButton';

interface ScheduleDisplayProps {
  date: Date;
  scheduleData: ScheduleData;
  onClassClick: (classItem: ClassItem) => void;
}

const ScheduleDisplay = ({ date, scheduleData, onClassClick }: ScheduleDisplayProps) => {
  const formattedDate = date.toLocaleDateString('en-US', { dateStyle: 'full' });
  const formattedSelectedDate = moment(date).format('YYYY-MM-DD');
  const selectedDateSchedule = scheduleData[formattedSelectedDate] || [];
  const hasScheduleItems = selectedDateSchedule.length > 0;

  return (
    <View style={styles.calendarItemCard}>
      <Text style={styles.subtitle}>{formattedDate}</Text>
      <View style={styles.scheduleContainer}>
        {hasScheduleItems ? (
          selectedDateSchedule.map((item) => (
            <TouchableOpacity key={item.time} onPress={() => onClassClick(item)}>
              <View style={styles.scheduleBlock}>
                <Text style={styles.className}>{item.className}</Text>
                <Text style={styles.classDetails}>
                  {item.location} - {item.time}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noSchedule}>No classes scheduled</Text>
        )}
      </View>
      <NextClassButton scheduleData={scheduleData} onNavigateToClass={onClassClick} />
    </View>
  );
};

const styles = StyleSheet.create({
  calendarItemCard: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
  },
  scheduleContainer: {
    marginTop: 10,
  },
  scheduleBlock: {
    backgroundColor: '#852C3A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  classDetails: {
    fontSize: 14,
    color: '#dce6ff',
  },
  noSchedule: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

export default ScheduleDisplay;
