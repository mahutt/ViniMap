import { View, Text, StyleSheet } from 'react-native';
import { useMap, MapState } from '@/modules/map/MapContext';

function getHint(state: MapState): string | null {
  switch (state) {
    case MapState.SelectingStartLocation:
      return 'Tap anywhere to set your start location';
    case MapState.SelectingEndLocation:
      return 'Tap anywhere to set your destination';
    default:
      return null;
  }
}

export default function MapHint() {
  const { state } = useMap();
  const hint = getHint(state);
  if (!hint) return null;
  return (
    <View style={styles.hintContainer}>
      <Text style={styles.hintText}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hintContainer: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
  },
  hintText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
