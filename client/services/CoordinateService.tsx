import * as Location from 'expo-location';

type Coordinates = [number, number];

export default class CoordinateService {
  static async getCurrentCoordinates(): Promise<Coordinates | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      const { latitude, longitude } = currentLocation.coords;
      return [longitude, latitude];
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }
}
