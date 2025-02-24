import React from 'react';
import { View, StyleSheet, Pressable, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '@/modules/map/MapService';

interface BottomFrameProps {
  selectedMode: string;
  modeIcon: React.ReactNode;
  durations: { [key: string]: number | null };
  distances: { [key: string]: number | null };
}

export function BottomFrame({ selectedMode, modeIcon, durations, distances }: BottomFrameProps) {
  const slideAnim = React.useRef(new Animated.Value(500)).current;

  //   Future code for drawer slide up and down
  //   const slideUp = () => {
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }).start();
  //   };

  const slideDown = () => {
    Animated.timing(slideAnim, {
      toValue: 250,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  //   Future code for drawer slide up and down
  //   const panResponder = React.useRef(
  //     PanResponder.create({
  //       onMoveShouldSetPanResponder: (_, gestureState) => true,
  //       onPanResponderMove: (_, gestureState) => {
  //         slideAnim.setValue(Math.min(gestureState.dy, 500));
  //       },
  //       onPanResponderRelease: (_, gestureState) => {
  //         if (gestureState.dy > 100) {
  //           slideDown();
  //         } else {
  //           slideUp();
  //         }
  //       },
  //     })
  //   ).current;

  return (
    <Animated.View
      style={[
        styles.infoContainer,
        // { transform: [{ translateY: slideAnim }] },
      ]}
      //{...panResponder.panHandlers}
    >
      <View>
        {/* <View style={styles.slideIndicator} />  uncomment to show slide indicator */}
        <View style={styles.infoContent}>
          <View style={styles.infoText}>
            <Text style={styles.boldText}>
              {durations[selectedMode] !== null ? formatDuration(durations[selectedMode]) : 0}{' '}
            </Text>
            <Text style={styles.infoText}>
              ({(Number(distances[selectedMode]) / 1000).toFixed(2)} km){' '}
            </Text>
            {/* {modeIcon} */}
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
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'white',
    padding: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 180,
    alignItems: 'flex-start',
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 30,
  },
  slideIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    marginBottom: 20,
    alignSelf: 'center',
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
    fontSize: 25,
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
  disabledTransportButton: {
    opacity: 0.5,
  },
});
export default BottomFrame;
