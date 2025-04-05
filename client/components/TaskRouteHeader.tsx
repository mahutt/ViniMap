import { useMap, MapState } from '@/modules/map/MapContext';
import { useTask } from '@/providers/TaskContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Alert } from 'react-native';

export default function TaskRouteHeader() {
  const { selectedTasks } = useTask();
  const { state, setState } = useMap();

  const [done, setDone] = useState(false);

  if (state !== MapState.TaskNavigation || selectedTasks.length === 0) {
    return;
  }

  const targetTask = selectedTasks.find((task) => !task.completed);
  const taskNumber = selectedTasks.findIndex((task) => !task.completed) + 1;
  if (!targetTask) {
    if (done) return;
    setDone(true);
    Alert.alert('🎉 All done!', "You'll be brought back to the map screen", [
      {
        text: 'OK',
        onPress: () => {
          setState(MapState.Idle);
        },
      },
    ]);
  }

  return (
    <View style={styles.headerContainer}>
      {taskNumber > 0 && <Text style={styles.taskNumber}>{taskNumber}</Text>}
      <Text style={targetTask ? styles.taskText : styles.completedTaskText}>
        {targetTask?.text ?? 'Tasks Completed'}
      </Text>
      <TouchableOpacity onPress={() => setState(MapState.Idle)} testID="close-button">
        <Ionicons name="close-outline" size={28} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskNumber: {
    backgroundColor: '#852C3A',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    borderRadius: 12,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  taskText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  completedTaskText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
});
