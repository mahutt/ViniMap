import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import moment from 'moment';
import Swiper from 'react-native-swiper';
import { extractScheduleData, fetchCalendarEvents } from '@/Services/GoogleScheduleService';
import SimpleModal from '@/components/CalendarIdBox';

const { width } = Dimensions.get('window');

export default function Schedule() {
  const swiper = useRef<Swiper | null>(null);
  const contentSwiper = useRef<Swiper | null>(null);
  const [week, setWeek] = useState(0);
  const [value, setValue] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<
    Record<string, { className: string; location: string; time: string }[]>
  >({});

  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSave = async (value: string): Promise<void> => {
    try {
      console.log('I AM IN HANDLE SAVE!!!');
      setInputValue(value);
      console.log('input Value: ', inputValue);
    } catch (error) {
      console.error('Error in handleSave:', error);
    }
  };

  useEffect(() => {
    console.log('Updated inputValue:', inputValue);

    if (inputValue === '') {
      return;
    }

    fetchAndSetSchedule(inputValue);
  }, [inputValue]);

  useEffect(() => {}, [scheduleData]);

  const fetchAndSetSchedule = async (calendarId: string) => {
    try {
      console.log('Fetching schedule for calendar ID:', calendarId);
      const calendarJson = await fetchCalendarEvents(calendarId);
      const newScheduleData = extractScheduleData(calendarJson);

      const updatedScheduleData: Record<
        string,
        { className: string; location: string; time: string }[]
      > = {};

      for (let i = 0; i <= 4; i++) {
        Object.keys(newScheduleData).forEach((date) => {
          const momentDate = moment(date)
            .add(i * 7, 'days')
            .format('YYYY-MM-DD');
          updatedScheduleData[momentDate] = newScheduleData[date];
        });
      }

      setScheduleData(updatedScheduleData);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  async function buttonPress() {
    setModalVisible(true);
  }

  const weeks = React.useMemo(() => {
    const start = moment().startOf('week'); // Always start from this week
    return Array.from({ length: 5 }).map((_, adj) => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day');
        return {
          weekday: date.format('ddd'),
          date: date.toDate(),
        };
      });
    });
  }, []);

  const days = React.useMemo(() => {
    return [moment(value).subtract(1, 'day').toDate(), value, moment(value).add(1, 'day').toDate()];
  }, [value]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SimpleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />

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
            index={0}
            ref={swiper}
            loop={false}
            showsPagination={false}
            onIndexChanged={(ind) => {
              if (ind < 0 || ind > 4) return; // Prevent scrolling past bounds
              setValue(
                moment(value)
                  .add(ind - week, 'week')
                  .toDate()
              );
              setTimeout(() => {
                setWeek(ind);

                if (swiper.current) {
                  swiper.current.scrollTo(ind, false);
                }
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
                const nextWeek = moment(value).isBefore(nextValue) ? week + 1 : week - 1;
                if (nextWeek < 0 || nextWeek > 4) return; // Prevent exceeding week bounds
                setWeek(nextWeek);
              }
              setValue(nextValue.toDate());
              if (swiper.current) {
                swiper.current.scrollTo(ind, false);
              }
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
                    schedule.map((item, idx) => (
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
    width: '20%',
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'absolute',
    right: 16,
    top: 0,
  },
  modal: {
    display: 'flex',
  },
});
