import React, { useState, useRef, useEffect } from 'react';
import { storage } from '@/Services/StorageService';
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
import { extractScheduleData, fetchCalendarEvents } from '@/Services/GoogleScheduleService';
import SimpleModal from '@/components/CalendarIdBox';

const { width } = Dimensions.get('window');

export default function Schedule() {
  const swiper = useRef<Swiper | null>(null);
  const [week, setWeek] = useState(0);
  const [value, setValue] = useState(new Date());
  const [scheduleData, setScheduleData] = useState<
    Record<string, { className: string; location: string; time: string }[]>
  >({});

  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSave = async (value: string): Promise<void> => {
    try {
      setInputValue(value);
    } catch (error) {
      console.error('Error in handleSave:', error);
    }
  };

  useEffect(() => {
    const calendarData = storage.getString('calendarData');

    if (calendarData) {
      try {
        const parsedData = JSON.parse(calendarData);
        setScheduleData(parsedData);
      } catch (error) {
        console.error('Error parsing stored calendar data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(scheduleData).length === 0) return;

    storage.set('calendarData', JSON.stringify(scheduleData));
  }, [scheduleData]);

  useEffect(() => {
    console.log('Updated inputValue:', inputValue);

    if (inputValue.trim() === '') return;

    fetchAndSetSchedule(inputValue);
  }, [inputValue]);

  const handleClassClick = (classItem: { className: string; location: string; time: string }) => {
    console.log('Class Clicked:', classItem);
  };

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
    const start = moment().startOf('week');
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
              if (ind < 0 || ind > 4) return;
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
                {dates.map((item) => {
                  const isActive = value.toDateString() === item.date.toDateString();
                  return (
                    <TouchableWithoutFeedback
                      key={item.date.toISOString()}
                      onPress={() => setValue(item.date)}>
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

        <View style={styles.calendarItemCard}>
          <Text style={styles.subtitle}>
            {value.toLocaleDateString('en-US', { dateStyle: 'full' })}
          </Text>
          <View style={styles.scheduleContainer}>
            {scheduleData[moment(value).format('YYYY-MM-DD')]?.length > 0 ? (
              scheduleData[moment(value).format('YYYY-MM-DD')].map((item) => (
                <TouchableOpacity key={item.time} onPress={() => handleClassClick(item)}>
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
        </View>
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
  calendarItemCard: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
});
