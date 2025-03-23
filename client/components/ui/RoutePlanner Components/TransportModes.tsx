import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { formatDuration } from '@/modules/map/MapService';

interface TransportModesProps {
  selectedMode: string;
  onMode: (mode: string) => void;
  durations: { [key: string]: number | null };
  isRouteFound: boolean;
  modes: { name: string; icon: string }[];
}

export function TransportModes({
  selectedMode,
  onMode,
  durations,
  isRouteFound,
  modes,
}: Readonly<TransportModesProps>) {
  return (
    <View style={styles.transportModeContainer}>
      {modes.map((mode) => {
        const isDisabled = isRouteFound && durations[mode.name] === null;
        return (
          <Pressable
            key={mode.name}
            style={[
              styles.transportButton,
              isRouteFound && selectedMode === mode.name && styles.activeTransportButton,
              isDisabled && styles.disabledTransportButton,
            ]}
            onPress={isDisabled ? null : () => onMode(mode.name)}>
            {mode.name === 'handicap' ? (
              <FontAwesome5 name="wheelchair" size={24} color="#666" />
            ) : (
              <Ionicons
                name={
                  mode.icon as 'walk-outline' | 'bicycle-outline' | 'car-outline' | 'bus-outline'
                }
                size={24}
                color="#666"
              />
            )}
            {isRouteFound && durations[mode.name] !== null && (
              <Text>
                {durations[mode.name] !== null ? formatDuration(durations[mode.name]) : ''}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  transportModeContainer: {
    paddingVertical: 2,
    paddingHorizontal: 15,
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    height: 50,
  },
  transportButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 1,
  },
  activeTransportButton: {
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  disabledTransportButton: {
    opacity: 0.5,
  },
});

export default TransportModes;
