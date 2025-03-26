import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import moment from 'moment';
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface WeekPickerProps {
  initialWeek?: number;
  value: Date;
  setValue: (date: Date) => void;
  weekRange?: number;
}

const WeekPicker = ({ initialWeek = 0, value, setValue, weekRange = 5 }: WeekPickerProps) => {
  const swiper = useRef<Swiper | null>(null);
  const [week, setWeek] = useState(initialWeek);

  const weeks = React.useMemo(() => {
    const start = moment().startOf('week');
    return Array.from({ length: weekRange }).map((_, adj) => {
      return Array.from({ length: 7 }).map((_, index) => {
        const date = moment(start).add(adj, 'week').add(index, 'day');
        return {
          weekday: date.format('ddd'),
          date: date.toDate(),
        };
      });
    });
  }, [weekRange]);

  const handlePreviousWeek = () => {
    if (week > 0) {
      const newWeek = week - 1;
      setWeek(newWeek);
      swiper.current?.scrollTo(newWeek);
      setValue(moment(value).subtract(1, 'week').toDate());
    }
  };

  const handleNextWeek = () => {
    if (week < weekRange - 1) {
      const newWeek = week + 1;
      setWeek(newWeek);
      swiper.current?.scrollTo(newWeek);
      setValue(moment(value).add(1, 'week').toDate());
    }
  };

  return (
    <View style={styles.picker}>
      <Swiper
        index={initialWeek}
        ref={swiper}
        loop={false}
        showsPagination={false}
        onIndexChanged={(ind) => {
          if (ind < 0 || ind > weekRange - 1) return;
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
        {weeks.map((dates) => (
          <View style={styles.itemRow} key={dates[0].date.toISOString()}>
            <TouchableOpacity
              style={[styles.navButton, week <= 0 && styles.disabledNavButton]}
              disabled={week <= 0}
              onPress={handlePreviousWeek}>
              <Ionicons name="chevron-back" size={16} color={week <= 0 ? '#cccccc' : 'black'} />
            </TouchableOpacity>

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
                    <Text style={[styles.weekDayText, isActive && { color: '#fff' }]}>
                      {item.weekday}
                    </Text>
                    <Text style={[styles.dateText, isActive && { color: '#fff' }]}>
                      {item.date.getDate()}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}

            <TouchableOpacity
              style={[styles.navButton, week >= weekRange - 1 && styles.disabledNavButton]}
              disabled={week >= weekRange - 1}
              onPress={handleNextWeek}>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={week >= weekRange - 1 ? '#cccccc' : 'black'}
              />
            </TouchableOpacity>
          </View>
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    flex: 1,
    maxHeight: 74,
    paddingVertical: 12,
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
  weekDayText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 20,
  },
  navButton: {
    padding: 0,
    zIndex: 10,
    height: 50,
    width: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledNavButton: {
    opacity: 0.5,
  },
});

export default WeekPicker;
