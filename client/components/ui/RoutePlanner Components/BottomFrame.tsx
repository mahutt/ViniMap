import React from 'react';
import { View, StyleSheet, Pressable, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '@/modules/map/MapService';

interface BottomFrameProps {
  readonly selectedMode: string;
  readonly modeIcon: React.ReactNode;
  readonly durations: { [key: string]: number | null };
  readonly distances: { [key: string]: number | null };
}

export function BottomFrame({ selectedMode, modeIcon, durations, distances }: BottomFrameProps) {
  return (
    <Animated.View style={[styles.infoContainer]}>
      <View>
        <View style={styles.infoContent}>
          <View style={styles.infoText}>
            <Text style={styles.boldText}>
              {durations[selectedMode] !== null ? formatDuration(durations[selectedMode]) : 0}{' '}
            </Text>
            <Text style={styles.infoText}>
              ({(Number(distances[selectedMode]) / 1000).toFixed(2)} km){' '}
            </Text>
            {modeIcon}
          </View>
          <Pressable style={styles.startButton} onPress={() => {}}>
            <Ionicons
              name="navigate-outline"
              size={16}
              color="white"
              style={styles.startButtonIcon}
            />
            <Text style={styles.startButtonText}>Start</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'white',
    padding: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '25%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    bottom: 0,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 25,
  },
  infoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  infoText: {
    color: '#333',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    fontSize: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#852C3A',
    paddingVertical: '3%',
    paddingHorizontal: '5%',
    borderRadius: 25,
    justifyContent: 'center',
    margin: 20,
  },
  startButtonIcon: {
    marginRight: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BottomFrame;
