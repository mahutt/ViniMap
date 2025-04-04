import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';

import { Task, Location, Route } from '@/types';
import { TaskList } from '@/classes/TaskList';
import { TaskListCaretaker } from '@/classes/TaskListCaretaker';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTask } from '@/providers/TaskContext';
import LocationsAutocomplete from '@/components/LocationsAutocomplete';
import TaskCard from '@/components/TaskCard';
import { MapState, useMap } from '@/modules/map/MapContext';
import { TaskService } from '@/services/TaskService';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  generateMissingDurations,
  generateMissingLocations,
  inferLocation,
} from '@/services/gptService';
import { getRoute } from '@/modules/map/MapService';
import CoordinateService from '@/services/CoordinateService';

export default function TasksScreen() {
  const { selectedTasks, setSelectedTasks, tasks, setTasks } = useTask();
  const { setState, setRoute, flyTo, userLocation, cameraRef } = useMap();

  const taskList = useRef(new TaskList());
  const caretaker = useRef(new TaskListCaretaker(taskList.current));

  const [taskName, setTaskName] = useState('');
  const [taskLocation, setTaskLocation] = useState('');

  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);
  const [taskDuration, setTaskDuration] = useState<number | null>(0);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [modifiableTask, setModifiableTask] = useState<Task | null>(null);

  const [newTaskLocation, setNewTaskLocation] = useState<Location | null>({
    name: '',
    coordinates: [0, 0],
  });

  const router = useRouter();

  useEffect(() => {
    if (tasks.length > 0) {
      taskList.current.setTasks(tasks);
    }
  }, [tasks]);

  const addTask = () => {
    if (!taskName.trim()) return;

    const newTask: Task = {
      id: tasks.length.toString(),
      text: taskName,
      location: newTaskLocation,
      startTime: taskStartTime,
      duration: taskDuration,
    };

    caretaker.current.save();
    taskList.current.addTask(newTask);

    setTasks([...taskList.current.getTasks()]);

    setTaskName('');
    setTaskLocation('');
    setTaskStartTime(null);
  };

  const deleteTask = (id: string) => {
    caretaker.current.save();
    taskList.current.removeTask(id);
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const getPreviouseState = () => {
    caretaker.current.undo();
    setTasks([...taskList.current.getTasks()]);
  };

  const toggleTaskSelection = (task: Task) => {
    let updatedTasks: Task[];

    const isSelected = selectedTasks.some((t) => t.id === task.id);

    if (isSelected) {
      updatedTasks = selectedTasks.filter((t) => t.id !== task.id);
    } else {
      updatedTasks = selectedTasks.concat(task);
    }
    setSelectedTasks(updatedTasks);
  };

  const editTask = (id: string) => {
    const tempTask = tasks.find((task) => task.id === id);

    if (!tempTask) {
      console.log('Task not found');
      return;
    }

    setModifiableTask(tempTask);

    setTaskName(tempTask.text);
    setTaskLocation(tempTask.location?.name ?? '');
    setNewTaskLocation(tempTask.location);

    setTaskStartTime(tempTask.startTime);
    setTaskDuration(tempTask.duration);
    setModalVisible(true);
  };

  const saveTaskChanges = () => {
    if (!modifiableTask) return;

    const updatedTasks = tasks.map((task) =>
      task.id === modifiableTask.id
        ? {
            ...task,
            text: taskName,
            location: newTaskLocation,
            startTime: taskStartTime,
            duration: taskDuration,
          }
        : task
    );

    setTasks(updatedTasks);
    setModalVisible(false);
    setTaskName('');
    setTaskLocation('');

    setModifiableTask(null);
  };

  const generateRoute = async () => {
    if (!userLocation) {
      console.error('User location is not available');
      return;
    }

    const testTasks = selectedTasks;
    const coreTaskCandidates = testTasks.filter((task) => task.startTime !== null);
    const fillerTasks = testTasks.filter((task) => task.startTime === null);

    const generateDurationsPromise = generateMissingDurations(testTasks);
    const generateLocationsPromise = generateMissingLocations(testTasks, [
      userLocation.coordinates[0],
      userLocation.coordinates[1],
    ]);

    // Generating missing durations and locations for all tasks
    await Promise.all([generateDurationsPromise, generateLocationsPromise]);

    // Core tasks have a start time and a location - tasks with a set time
    // and with no location at this point are implicitly discarded, as the location
    const coreTasks = coreTaskCandidates
      .filter((task) => task.location !== null)
      .sort((a, b) => {
        const aHour = a.startTime?.getHours() || 0;
        const bHour = b.startTime?.getHours() || 0;
        return aHour - bHour;
      });

    // const taskRoute = await getMultiRoute(
    //   [userLocation].concat(coreTasks.map((task) => task.location!)),
    //   'walking'
    // );

    const partialRoutes = await TaskService.getOptimalRouteForPaths(userLocation, coreTasks);

    // should be removed eventually
    setSelectedTasks(coreTasks);

    const totalDuration = partialRoutes.reduce((acc, route) => acc + route.duration, 0);
    const totalDistance = partialRoutes.reduce((acc, route) => acc + route.distance, 0);
    const segments = partialRoutes.flatMap((route) => route.segments);
    for (let i = 0; i < segments.length; i++) {
      segments[i].id = ('segement' + i).toString();
    }
    const taskRoute: Route = {
      duration: totalDuration,
      distance: totalDistance,
      segments: segments,
    };

    if (!taskRoute) {
      console.error('Failed to generate route');
      return;
    }

    setRoute(taskRoute);
    router.push('/');

    setTimeout(() => {
      // This is duplicate code that should be refactored
      if (taskRoute.segments.length > 0 && cameraRef.current) {
        const bounds = CoordinateService.calculateRouteCoordinateBounds(taskRoute);
        cameraRef.current.fitBounds(
          bounds.ne,
          bounds.sw,
          50, // padding
          1500 // animation duration
        );
      }
    }, 50);

    setState(MapState.TaskNavigation);
  };

  const toggleStartTimePicker = () => {
    setShowStartTimePicker(!showStartTimePicker);
  };

  const clearStartTime = () => {
    setTaskStartTime(null);
  };

  const clearLocation = () => {
    setTaskLocation('');
    setNewTaskLocation(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tasksWrapper}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <TouchableOpacity testID="undo-button" onPress={getPreviouseState}>
            <IconSymbol size={24} name="arrow.uturn.backward" color="#852C3A" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {tasks.length === 0 ? (
            <Text style={styles.noTasksText}>No tasks yet.</Text>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                text={task.text}
                selected={selectedTasks.some((t) => t.id === task.id)}
                onDelete={() => deleteTask(task.id)}
                onSelect={() => toggleTaskSelection(task)}
                modifyTask={() => editTask(task.id)}
              />
            ))
          )}
        </ScrollView>

        <View style={styles.allInputsContainer}>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => {
              setModifiableTask(null);
              setTaskName('');
              setTaskLocation('');
              setTaskStartTime(null);
              setTaskDuration(null);
              setModalVisible(true);
            }}>
            <Text style={styles.plusButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pathButton} onPress={generateRoute}>
            <Text style={styles.pathButtonText}>Generate Path</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modifiableTask ? 'Edit Task' : 'Add Task'}</Text>

            <TextInput
              placeholder="Task name"
              style={styles.inputText}
              value={taskName}
              onChangeText={setTaskName}
            />

            <View style={styles.inputWithClearContainer}>
              <TextInput
                placeholder="Location"
                style={[styles.inputText, styles.inputWithClear]}
                value={taskLocation}
                onChangeText={(text) => {
                  setTaskLocation(text);
                  setAutocompleteVisible(text.length > 0);
                }}
                onBlur={() => setTimeout(() => setAutocompleteVisible(false), 200)}
              />
              {taskLocation ? (
                <TouchableOpacity style={styles.clearButton} onPress={clearLocation}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.timeInputs}>
              <View style={styles.timeInputContainer}>
                <Text>Start Time:</Text>
                {taskStartTime ? (
                  <View style={styles.timeDisplayContainer}>
                    <Text>
                      {taskStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <TouchableOpacity onPress={clearStartTime} style={styles.timeClearButton}>
                      <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : showStartTimePicker ? (
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
                ) : (
                  <TouchableOpacity onPress={toggleStartTimePicker} style={styles.addTimeButton}>
                    <Text style={styles.addTimeButtonText}>Set Time</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.timeInputContainer}>
                <Text>Duration</Text>
                <TextInput
                  placeholder="min"
                  style={styles.durationInput}
                  value={taskDuration === null || taskDuration === 0 ? '' : taskDuration.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (text === '') {
                      setTaskDuration(null);
                    } else {
                      const minutes = parseInt(text, 10);
                      setTaskDuration(isNaN(minutes) ? 0 : minutes);
                    }
                  }}
                />
              </View>
            </View>

            {autocompleteVisible && (
              <View style={{ width: '100%' }}>
                <LocationsAutocomplete
                  query={taskLocation}
                  callback={async (location) => {
                    setTaskLocation(location.name ?? 'Un-named Location');
                    setNewTaskLocation(location);
                    setAutocompleteVisible(false);
                  }}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={modifiableTask ? saveTaskChanges : addTask}>
              <Text style={styles.addButtonText}>{modifiableTask ? 'Save Task' : 'Add Task'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModal}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAED', padding: 20 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  inputText: {
    backgroundColor: '#FFF',
    borderColor: '#ddd',
    borderWidth: 1,
    width: '100%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#852C3A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  closeModal: { color: '#852C3A', marginTop: 15 },

  tasksWrapper: { paddingTop: 80 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold' },
  scrollView: {
    height: 500,
    borderColor: '#852C3A',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#E8EAED',
  },
  noTasksText: { textAlign: 'center', marginTop: 20, color: 'gray' },

  inputContainer: { flex: 1, marginRight: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  undo: {
    fontSize: 16,
    color: '#852C3A',
    paddingRight: 10,
  },
  plusButtonDisabled: {
    backgroundColor: '#ccc',
  },
  allInputsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },

  pathButton: {
    backgroundColor: '#852C3A',
    width: 250,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  pathButtonText: {
    fontSize: 18,
    color: '#FFF',
  },

  plusButton: {
    backgroundColor: '#852C3A',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 5,
  },

  plusButtonText: {
    fontSize: 24,
    color: '#FFF',
  },
  timeInputContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    flex: 1,
  },
  durationInput: {
    backgroundColor: '#FFF',
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    width: 100,
  },
  timeInputs: {
    width: '100%',
    flexDirection: 'row',
  },
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
  inputWithClear: {
    paddingRight: 40,
  },
  inputWithClearContainer: {
    flexDirection: 'row',
    width: '100%',
    position: 'relative',
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 5,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#852C3A',
  },
});
