import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import Swiper from 'react-native-swiper';
import { handleCalendarAccess } from '@/Services/GoogleAuthService';

const { width } = Dimensions.get('window');

const scheduleData = {
  '2025-02-13': [
    { className: 'Math 101', location: 'Room A1', time: '9:00 AM - 10:30 AM' },
    { className: 'Physics 202', location: 'Room B2', time: '11:00 AM - 12:30 PM' },
  ],
  '2025-02-14': [{ className: 'History 301', location: 'Room C3', time: '1:00 PM - 2:30 PM' }],
};

async function buttonPress() {
  const result = await handleCalendarAccess();
}

export default function Schedule() {
  const swiper = useRef();
  const contentSwiper = useRef();
  const [week, setWeek] = useState(0);
  const [value, setValue] = useState(new Date());

  const weeks = React.useMemo(() => {
    const start = moment().add(week, 'weeks').startOf('week');
    return [-1, 0, 1].map((adj) => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day');
        return {
          weekday: date.format('ddd'),
          date: date.toDate(),
        };
      });
    });
  }, [week]);

  const days = React.useMemo(() => {
    return [moment(value).subtract(1, 'day').toDate(), value, moment(value).add(1, 'day').toDate()];
  }, [value]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Schedule</Text>
          <View style={styles.uploadButton}>
            <TouchableOpacity onPress={buttonPress}>
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.picker}>
          <Swiper
            index={1}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={(ind) => {
              if (ind === 1) return;
              const index = ind - 1;
              setValue(moment(value).add(index, 'week').toDate());
              setTimeout(() => {
                setWeek(week + index);
                swiper.current.scrollTo(1, false);
              }, 10);
            }}>
            {weeks.map((dates, index) => (
              <View style={styles.itemRow} key={index}>
                {dates.map((item, dateIndex) => {
                  const isActive = value.toDateString() === item.date.toDateString();
                  return (
                    <TouchableWithoutFeedback key={dateIndex} onPress={() => setValue(item.date)}>
                      <View
                        style={[
                          styles.item,
                          isActive && { backgroundColor: '#111', borderColor: '#111' },
                        ]}>
                        <Text style={[styles.weekDatText, isActive && { color: '#fff' }]}>
                          {item.weekday}
                        </Text>
                        <Text style={[styles.dateText, isActive && { color: '#fff' }]}>
                          {item.date.getDate()}
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            ))}
          </Swiper>
        </View>

        <Swiper
          index={1}
          ref={contentSwiper}
          loop={false}
          showsPagination={false}
          onIndexChanged={(ind) => {
            if (ind === 1) return;
            setTimeout(() => {
              const nextValue = moment(value).add(ind - 1, 'days');
              if (moment(value).week() !== nextValue.week()) {
                setWeek(moment(value).isBefore(nextValue) ? week + 1 : week - 1);
              }
              setValue(nextValue.toDate());
              contentSwiper.current.scrollTo(1, false);
            }, 10);
          }}>
          {days.map((day, index) => {
            const dateString = moment(day).format('YYYY-MM-DD');
            const schedule = scheduleData[dateString] || [];
            return (
              <View key={index} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
                <Text style={styles.subtitle}>
                  {day.toLocaleDateString('en-US', { dateStyle: 'full' })}
                </Text>
                <View style={styles.scheduleContainer}>
                  {schedule.length > 0 ? (
                    schedule.map((item: any, idx: any) => (
                      <View key={idx} style={styles.scheduleBlock}>
                        <Text style={styles.className}>{item.className}</Text>
                        <Text style={styles.classDetails}>
                          {item.location} - {item.time}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noSchedule}>No classes scheduled</Text>
                  )}
                </View>
              </View>
            );
          })}
        </Swiper>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 12,
  },
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
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
  itemRow: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDatText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 20,
  },
  uploadButtonText: {
    color: 'white',
  },
  uploadButton: {
    backgroundColor: '#852C3A',
    display: 'flex',
    width: '20%',
    minHeight: 40, // Use a fixed height instead of a percentage
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Use `8` instead of percentage for a more natural rounded look
    paddingHorizontal: '2.5%',
    textAlign: 'center',
    position: 'absolute', // Prevents it from affecting other elements' layout
    right: 16, // Instead of `left: '80%'`
    top: 0, // Adjust this if needed
  },
});
