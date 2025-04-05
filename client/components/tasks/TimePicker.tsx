import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TimePicker({
  taskStartTime,
  setTaskStartTime,
  showStartTimePicker,
  setShowStartTimePicker,
  toggleStartTimePicker,
  clearStartTime,
}: Readonly<{
  taskStartTime: Date | null;
  setTaskStartTime: (time: Date | null) => void;
  showStartTimePicker: boolean;
  setShowStartTimePicker: (show: boolean) => void;
  toggleStartTimePicker: () => void;
  clearStartTime: () => void;
}>) {
  if (taskStartTime) {
    return (
      <View style={styles.timeDisplayContainer}>
        <Text>{taskStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        <TouchableOpacity onPress={clearStartTime} style={styles.timeClearButton}>
          <Text style={styles.clearButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (showStartTimePicker) {
    return (
      <View style={styles.timeInputContainer}>
        <DateTimePicker
          value={taskStartTime ?? new Date()}
          mode="time"
          display="default"
          style={{ zIndex: 1000 }}
          onChange={(_, selectedTime) => {
            setShowStartTimePicker(false);
            if (selectedTime) {
              setTaskStartTime(selectedTime);
            }
          }}
        />
      </View>
    );
  } else {
    return (
      <TouchableOpacity onPress={toggleStartTimePicker} style={styles.addTimeButton}>
        <Text style={styles.addTimeButtonText}>Set Time</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  timeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
  },
  timeClearButton: {
    marginLeft: 8,
    alignItems: 'center',
  },
  addTimeButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
  },
  addTimeButtonText: {
    color: '#852C3A',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#852C3A',
  },
  timeInputContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    flex: 1,
  },
});
