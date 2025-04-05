import { useMap, MapState } from '@/modules/map/MapContext';
import { useTask } from '@/providers/TaskContext';
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TaskService } from '@/services/TaskService';

const TaskFrame = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { selectedTasks, markTask, setSelectedTasks } = useTask();
  const { setState, setRoute, userLocation } = useMap();

  // Later, I can get the inactive tasks.
  const activeTasks = selectedTasks.filter((task) => task.data !== undefined);

  const [reloadRoute, setReloadRoute] = React.useState(false);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '';

    if (minutes < 60) {
      return `Duration: ${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `Duration: ${hours}h ${remainingMinutes}m`
        : `Duration: ${hours}h`;
    }
  };

  useEffect(() => {
    if (!reloadRoute) return;
    if (!userLocation) return;
    const tasksToRoute = selectedTasks.filter((task) => !task.completed);
    TaskService.generateTaskRoute(userLocation, tasksToRoute).then(({ route, tasks }) => {
      setRoute(route);
      setReloadRoute(false);
    });
  }, [selectedTasks, reloadRoute, userLocation, setRoute, setSelectedTasks]);

  const handleTaskComplete = (taskId: string) => {
    const task = selectedTasks.find((task) => task.id === taskId);
    if (task) {
      markTask(taskId, !task.completed);
      setReloadRoute(true);
    }
  };

  const showTasks = () => {
    if (activeTasks.length === 0) {
      return <Text style={styles.noTasksText}>No tasks available</Text>;
    }

    const taskItems = activeTasks.map((item, index) => {
      const isCompleted = item.completed;

      return (
        <View key={item.id} style={styles.textContainer}>
          <View style={styles.circle}>
            <Text style={styles.circleText}>{index + 1}</Text>
          </View>
          <View style={styles.taskContent}>
            <Text style={[styles.text, isCompleted && styles.completedText]}>{item.text}</Text>
            <View style={styles.taskDetails}>
              <Text style={[styles.timeText, isCompleted && styles.completedText]}>
                <Text style={[styles.boldText, isCompleted && styles.completedText]}>
                  {item.data?.time}
                </Text>
              </Text>
              <Text style={[styles.durationText, isCompleted && styles.completedText]}>
                {formatDuration(item.duration)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.checkmark, isCompleted && styles.checkmarkCompleted]}
            onPress={() => handleTaskComplete(item.id)}
          />
        </View>
      );
    });

    return taskItems;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.doneButton} onPress={() => setState(MapState.Idle)}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}>
        {showTasks()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    height: '30%',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  scrollView: {
    flexGrow: 1,
    paddingTop: 30,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#852C3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  circleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    textAlign: 'left',
    flexShrink: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  doneButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    backgroundColor: '#852C3A',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    zIndex: 1,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noTasksText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
  taskDetails: {
    flexDirection: 'row',
    marginTop: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#555',
    marginRight: 10,
  },
  durationText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: 'white',
  },
  checkmarkCompleted: {
    backgroundColor: '#000',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  taskContent: {
    flex: 1,
  },
});

export default TaskFrame;
