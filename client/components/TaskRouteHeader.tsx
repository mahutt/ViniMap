import { useMap, MapState } from '@/modules/map/MapContext';
import { useTask } from '@/providers/TaskContext';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TaskRouteHeader() {
  const { selectedTasks } = useTask();
  const { state, setState } = useMap();

  if (state !== MapState.TaskNavigation || selectedTasks.length === 0) {
    return;
  }

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.taskNumber}>1</Text>
      <Text style={styles.taskText}>{selectedTasks[0].text}</Text>
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
});
