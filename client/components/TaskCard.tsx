import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface TaskCardProps {
  text: string;
  selected: boolean;
  onDelete: () => void;
  onSelect: () => void;
  modifyTask: () => void;
}

const TaskCard = ({ text, selected, onDelete, onSelect, modifyTask }: TaskCardProps) => {
  return (
    <TouchableOpacity onPress={modifyTask}>
      <View style={styles.item}>
        <View style={styles.itemLeft}>
          <TouchableOpacity onPress={onSelect} activeOpacity={0.7}>
            <View style={[styles.square, selected && styles.selectedSquare]} />
          </TouchableOpacity>
          <Text style={styles.itemText}>{text}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={modifyTask}>
            <IconSymbol name="pencil" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onDelete}>
            <IconSymbol name="trash" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
    borderRadius: 5,
    marginRight: 15,
    opacity: 0.4,
  },
  selectedSquare: {
    backgroundColor: '#852C3A',
    opacity: 1,
  },
  itemText: {
    maxWidth: '80%',
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 28,
    height: 28,
    backgroundColor: '#852C3A',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

export default TaskCard;
