import TaskCard from '@/components/TaskCard';
import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Task } from '@/modules/map/Types';
import { TaskList } from '@/classes/TaskList';
import { TaskListCaretaker } from '@/classes/TaskListCaretaker';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTask } from '@/providers/TodoListContext';
import { MMKV } from 'react-native-mmkv';
import { storage } from '@/services/StorageService';

export default function TasksScreen() {
  const { selectedTasks, setSelectedTasks } = useTask();

  const taskList = useRef(new TaskList());
  const caretaker = useRef(new TaskListCaretaker(taskList.current));

  const [tasks, setTasks] = useState<Task[]>(taskList.current.getTasks());
  const [taskName, setTaskName] = useState('');
  const [taskLocation, setTaskLocation] = useState('');

  const isButtonDisabled = !taskName.trim() || !taskLocation.trim();

  useEffect(() => {
    const savedTasks = storage.getString('all_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    storage.set('all_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!taskName.trim() || !taskLocation.trim()) return;

    const newTask: Task = {
      id: tasks.length.toString(),
      text: taskName,
      coordinates: [0, 0],
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

  return (
    <View style={styles.container}>
      <View style={styles.tasksWrapper}>
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <TouchableOpacity onPress={getPreviouseState}>
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
              />
            ))
          )}
        </ScrollView>

        <View style={styles.allInputsContainer}>
          <View style={styles.inputContainer}>
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
              onChangeText={setTaskLocation}
            />
          </View>
          <TouchableOpacity
            style={[styles.plusButton, isButtonDisabled && styles.plusButtonDisabled]}
            onPress={addTask}
            disabled={isButtonDisabled}>
            <Text style={styles.plusButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  allInputsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  inputContainer: { flex: 1, marginRight: 10 },
  inputText: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  plusButton: {
    backgroundColor: '#852C3A',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  plusButtonText: { fontSize: 24, color: '#FFF' },
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
});
