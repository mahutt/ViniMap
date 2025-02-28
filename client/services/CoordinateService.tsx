import * as Location from 'expo-location';
import { Platform } from 'react-native';

type Coordinates = [number, number];

export default class CoordinateService {
  static async getCurrentCoordinates(): Promise<Coordinates | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return null;
      }

      const locationPromise = Location.getCurrentPositionAsync({});
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('')), 2000);
      });

      const currentLocation = (await Promise.race([
        locationPromise,
        timeoutPromise,
      ])) as Location.LocationObject;

      const { latitude, longitude } = currentLocation.coords;
      return [longitude, latitude];
    } catch (error) {
      if (Platform.OS === 'android') {
        return [45.496067, -73.569315];
      }

      return null;
    }
  }
}
