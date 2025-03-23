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
import { Coordinates, Location, Task } from '@/modules/map/Types';
import { TaskList } from '@/classes/TaskList';
import { TaskListCaretaker } from '@/classes/TaskListCaretaker';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTask } from '@/providers/TaskContext';
import LocationsAutocomplete from '@/components/LocationsAutocomplete';
import { getLocations } from '@/modules/map/MapService';
import TaskCard from '@/components/TaskCard';
import { MapState, useMap } from '@/modules/map/MapContext';
import { TaskService } from '@/services/TaskService';
import CoordinateService from '@/services/CoordinateService';
import { useRouter } from 'expo-router';

export default function TasksScreen() {
  const {
    selectedTasks,
    setSelectedTasks,
    tasks,
    setTasks,
    setIsTaskPlanning,
    setTaskRouteDescriptions,
  } = useTask();
  const { setState, setRoute, flyTo, userLocation } = useMap();

  const taskList = useRef(new TaskList());
  const caretaker = useRef(new TaskListCaretaker(taskList.current));

  const [taskName, setTaskName] = useState('');
  const [taskLocation, setTaskLocation] = useState('');

  const [autocompleteVisible, setAutocompleteVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [modifiableTask, setModifiableTask] = useState<Task>();

  const [newTaskLocation, setNewTaskLocation] = useState<Location>({
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
    if (!taskName.trim() || !taskLocation.trim()) return;

    const newTask: Task = {
      id: tasks.length.toString(),
      text: taskName,
      location: newTaskLocation,
    };

    caretaker.current.save();
    taskList.current.addTask(newTask);

    setTasks([...taskList.current.getTasks()]);

    setTaskName('');
    setTaskLocation('');
  };

  const deleteTask = (id: string) => {
    caretaker.current.save();
    taskList.current.setTasks(tasks.filter((task) => task.id !== id));
    setTasks([...taskList.current.getTasks()]);
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
    console.log('Trying to modify');
    const tempTask = tasks.find((task) => task.id === id);

    if (!tempTask) {
      console.log('Task not found');
      return;
    }

    setModifiableTask(tempTask);

    setTaskName(tempTask.text);
    setTaskLocation(tempTask.location.name ?? '');

    setModalVisible(true);
  };

  const saveTaskChanges = () => {
    if (!modifiableTask) return;

    const updatedTasks = tasks.map((task) =>
      task.id === modifiableTask.id
        ? { ...task, text: taskName, location: { ...task.location, name: taskLocation } }
        : task
    );

    setTasks(updatedTasks);
    setModalVisible(false);
    setTaskName('');
    setTaskLocation('');
    setModifiableTask(undefined);
  };

  const generateRoute = async () => {
    const currenCoords: Coordinates = await CoordinateService.getCurrentCoordinates();

    const currentLocation: Location = {
      name: 'Current Location',
      coordinates: currenCoords,
    };

    const currentLocationTask: Task = {
      id: '1000',
      text: 'First Tasks',
      location: currentLocation,
    };

    const tasksForRouting: Task[] = [];

    tasksForRouting.push(currentLocationTask);
    tasksForRouting.push(...selectedTasks);

    let newRoute = await TaskService.getOptimalRouteForPaths(
      tasksForRouting,
      setTaskRouteDescriptions
    );

    for (let i = 0; i < newRoute.segments.length; i++) {
      newRoute.segments[i].id = ('segement' + i).toString();
    }

    setRoute(newRoute);
    router.push('/');

    setTimeout(() => {
      if (userLocation) {
        flyTo(userLocation.coordinates, 17);
      }
    }, 50);

    setState(MapState.RoutePlanning);

    setIsTaskPlanning(true);
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
          <TouchableOpacity style={styles.plusButton} onPress={() => setModalVisible(true)}>
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

            <TextInput
              placeholder="Location"
              style={styles.inputText}
              value={taskLocation}
              onChangeText={(text) => {
                setTaskLocation(text);
                setAutocompleteVisible(text.length > 0);
              }}
              onBlur={() => setTimeout(() => setAutocompleteVisible(false), 200)}
            />

            {autocompleteVisible && (
              <View style={{ width: '100%' }}>
                <LocationsAutocomplete
                  query={taskLocation}
                  callback={async (location) => {
                    setTaskLocation(location.name ?? '');
                    const locationResults = await getLocations(taskLocation);
                    if (locationResults.length > 0) {
                      setNewTaskLocation(locationResults[0]);
                    }
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
});
