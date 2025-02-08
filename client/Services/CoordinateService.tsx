import * as Location from 'expo-location';

type Coordinates = [number, number];

export default class CoordinateService {
  static async getCurrentCoordinates(): Promise<Coordinates | null> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Please grant location permissions');
      return null;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      return [longitude, latitude];
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }
}
