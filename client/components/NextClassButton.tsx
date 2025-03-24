import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { findNextClass, ClassItem, ScheduleData } from '../services/NextClassService';

interface NextClassButtonProps {
  scheduleData: ScheduleData;
  onNavigateToClass: (classItem: ClassItem) => void;
}

const NextClassButton: React.FC<NextClassButtonProps> = ({ scheduleData, onNavigateToClass }) => {
  const handleNextClassPress = () => {
    try {
      if (!scheduleData) {
        Alert.alert('No Schedule Data', 'Please load your class schedule first.');
        return;
      }

      const nextClass = findNextClass(scheduleData);

      if (nextClass) {
        onNavigateToClass(nextClass);
      } else {
        Alert.alert('No Classes', 'There are no classes scheduled.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while finding your class. Please try again.');
    }
  };

  return (
    <View style={styles.nextClassButtonContainer}>
      <TouchableOpacity style={styles.nextClassButton} onPress={handleNextClassPress}>
        <Text style={styles.nextClassButtonText}>Go to Next Class</Text>
        <Ionicons name="navigate" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  nextClassButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 10,
  },
  nextClassButton: {
    flexDirection: 'row',
    backgroundColor: '#852C3A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextClassButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 6,
  },
});

export default NextClassButton;
