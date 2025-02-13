import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Swiper from 'react-native-swiper';
import moment from 'moment';

const { width } = Dimensions.get('window');

export default function Example() {
  const [week, setWeek] = useState(0);
  const [value, setValue] = useState(new Date());

  const weeks = useMemo(() => {
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

  const days = useMemo(() => {
    return [moment(value).subtract(1, 'day').toDate(), value, moment(value).add(1, 'day').toDate()];
  }, [value]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Schedule</Text>
        </View>

        <View style={styles.picker}>
          <Swiper
            index={1}
            loop={false}
            showsPagination={false}
            onIndexChanged={(ind) => {
              if (ind !== 1) {
                setValue(
                  moment(value)
                    .add(ind - 1, 'week')
                    .toDate()
                );
                setTimeout(() => setWeek(week + (ind - 1)), 10);
              }
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
                        <Text style={[styles.itemWeekday, isActive && { color: '#fff' }]}>
                          {item.weekday}
                        </Text>
                        <Text style={[styles.itemDate, isActive && { color: '#fff' }]}>
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
          loop={false}
          showsPagination={false}
          onIndexChanged={(ind) => {
            if (ind !== 1) {
              setTimeout(() => {
                const nextValue = moment(value).add(ind - 1, 'days');
                if (moment(value).week() !== nextValue.week()) {
                  setWeek(moment(value).isBefore(nextValue) ? week + 1 : week - 1);
                }
                setValue(nextValue.toDate());
              }, 10);
            }
          }}>
          {days.map((day, index) => (
            <View key={index} style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
              <Text style={styles.subtitle}>
                {day.toLocaleDateString('en-US', { dateStyle: 'full' })}
              </Text>
              <View style={styles.placeholder}>
                <View style={styles.placeholderInset} />
              </View>
            </View>
          ))}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 12,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
  },
  item: {
    flex: 1,
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e3e3e3',
    flexDirection: 'column',
    alignItems: 'center',
  },
  itemRow: {
    width: width,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  itemWeekday: {
    fontSize: 13,
    fontWeight: '500',
    color: '#737373',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  placeholder: {
    flexGrow: 1,
    height: 400,
    backgroundColor: 'transparent',
    marginBottom: '5%',
  },
  placeholderInset: {
    borderWidth: 4,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 9,
    flexGrow: 1,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
