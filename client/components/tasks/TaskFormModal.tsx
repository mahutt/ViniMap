import { Modal, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import LocationsAutocomplete from '@/components/LocationsAutocomplete';

import TimePicker from './TimePicker';
import { Location, Task } from '@/types';

export default function TaskFormModal({
  modalVisible,
  setModalVisible,
  taskName,
  setTaskName,
  taskLocation,
  setTaskLocation,
  taskStartTime,
  setTaskStartTime,
  taskDuration,
  setTaskDuration,
  showStartTimePicker,
  setShowStartTimePicker,
  toggleStartTimePicker,
  clearStartTime,
  clearLocation,
  addTask,
  modifiableTask,
  saveTaskChanges,
  setNewTaskLocation,
  autocompleteVisible,
  setAutocompleteVisible,
}: Readonly<{
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  taskName: string;
  setTaskName: (name: string) => void;
  taskLocation: string;
  setTaskLocation: (location: string) => void;
  taskStartTime: Date | null;
  setTaskStartTime: (time: Date | null) => void;
  taskDuration: number | null;
  setTaskDuration: (duration: number | null) => void;
  showStartTimePicker: boolean;
  setShowStartTimePicker: (show: boolean) => void;
  toggleStartTimePicker: () => void;
  clearStartTime: () => void;
  clearLocation: () => void;
  addTask: () => void;
  modifiableTask?: Task | null;
  saveTaskChanges?: () => void;
  setNewTaskLocation: (location: Location | null) => void;
  autocompleteVisible?: boolean;
  setAutocompleteVisible: (visible: boolean) => void;
}>) {
  return (
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
            {autocompleteVisible && (
              <LocationsAutocomplete
                query={taskLocation}
                callback={async (location) => {
                  setTaskLocation(location.name ?? 'Un-named Location');
                  setNewTaskLocation(location);
                  setAutocompleteVisible(false);
                }}
              />
            )}
          </View>

          <View style={styles.timeInputs}>
            <View style={styles.timeInputContainer}>
              <Text>Start Time:</Text>
              <TimePicker
                taskStartTime={taskStartTime}
                setTaskStartTime={setTaskStartTime}
                showStartTimePicker={showStartTimePicker}
                setShowStartTimePicker={setShowStartTimePicker}
                toggleStartTimePicker={toggleStartTimePicker}
                clearStartTime={clearStartTime}
              />
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
  );
}

const styles = StyleSheet.create({
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
