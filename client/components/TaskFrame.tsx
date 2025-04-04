import { useMap, MapState } from '@/modules/map/MapContext';
import { useTask } from '@/providers/TaskContext';
import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const TaskFrame = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { selectedTasks } = useTask();
  const { setState } = useMap();

  // Later, I can get the inactive tasks.
  const activeTasks = selectedTasks.filter((task) => task.data !== undefined);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.doneButton} onPress={() => setState(MapState.Idle)}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}>
        {activeTasks.length === 0 ? (
          <Text style={styles.noTasksText}>No tasks available</Text>
        ) : (
          activeTasks.map((item, index) => (
            <View key={item.id} style={styles.textContainer}>
              <View style={styles.circle}>
                <Text style={styles.circleText}>{index + 1}</Text>
              </View>
              <Text style={styles.text}>
                {item.text} - <Text style={styles.boldText}>{item.data?.time}</Text>
              </Text>
            </View>
          ))
        )}
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
});

export default TaskFrame;
