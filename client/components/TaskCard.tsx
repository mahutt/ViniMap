import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface TaskCardProps {
  text: string;
  onDelete: () => void;
}

const TaskCard = ({ text, onDelete }: TaskCardProps) => {
  return (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={styles.square}></View>
        <Text style={styles.itemText}>{text}</Text>
      </View>
      <TouchableOpacity style={styles.circular} onPress={onDelete}>
        <IconSymbol name="xmark" size={14} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  square: {
    width: 24,
    height: 24,
    backgroundColor: '#852C3A',
    opacity: 0.4,
    borderRadius: 5,
    marginRight: 15,
  },
  itemText: {
    maxWidth: '80%',
  },
  circular: {
    width: 20,
    height: 20,
    backgroundColor: '#852C3A',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
});

export default TaskCard;
