import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const data = [
  { name: 'Go to Sofias', duration: 1.5 },
  { name: 'Go to School', duration: 3 },
  { name: 'Get haircut', duration: 0.5 },
  { name: 'Go back to school', duration: 2 },
];

const TaskFrame = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.doneButton}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}>
        {data.map((item, index) => (
          <View key={index} style={styles.textContainer}>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{index + 1}</Text>
            </View>
            <Text style={styles.text}>
              {item.name} -{' '}
              <Text style={styles.boldText}>
                {item.duration} {item.duration === 1 ? 'hour' : 'hours'}
              </Text>
            </Text>
          </View>
        ))}
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
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TaskFrame;
