import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

import { Task, Location } from '@/types';
import { TaskList } from '@/classes/TaskList';
import { TaskListCaretaker } from '@/classes/TaskListCaretaker';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTask } from '@/providers/TaskContext';
import TaskCard from '@/components/TaskCard';
import { MapState, useMap } from '@/modules/map/MapContext';
import { TaskService } from '@/services/TaskService';
import { useRouter } from 'expo-router';
import CoordinateService from '@/services/CoordinateService';
import TaskFormModal from '@/components/tasks/TaskFormModal';

export default function TasksScreen() {
  const { selectedTasks, setSelectedTasks, tasks, setTasks } = useTask();
  const { setState, setRoute, userLocation, cameraRef } = useMap();

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

    const { tasks: coreTasks, route: taskRoute } = await TaskService.generateTaskRoute(
      userLocation,
      testTasks
    );

    // should be removed eventually
    setSelectedTasks(coreTasks);

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
      <TaskFormModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        taskName={taskName}
        setTaskName={setTaskName}
        taskLocation={taskLocation}
        setTaskLocation={setTaskLocation}
        taskStartTime={taskStartTime}
        setTaskStartTime={setTaskStartTime}
        taskDuration={taskDuration}
        setTaskDuration={setTaskDuration}
        showStartTimePicker={showStartTimePicker}
        setShowStartTimePicker={setShowStartTimePicker}
        toggleStartTimePicker={toggleStartTimePicker}
        clearStartTime={clearStartTime}
        clearLocation={clearLocation}
        addTask={addTask}
        modifiableTask={modifiableTask}
        saveTaskChanges={saveTaskChanges}
        setNewTaskLocation={setNewTaskLocation}
        autocompleteVisible={autocompleteVisible}
        setAutocompleteVisible={setAutocompleteVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAED', padding: 20 },
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
});
