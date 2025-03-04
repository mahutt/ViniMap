import * as Location from 'expo-location';

type Coordinates = [number, number];

export default class CoordinateService {
  static async getCurrentCoordinates(): Promise<Coordinates> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return [45.494836, -73.577913];
      }

      const locationPromise = Location.getCurrentPositionAsync({});
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Location retrieval timeout')), 3000);
      });

      const currentLocation = (await Promise.race([
        locationPromise,
        timeoutPromise,
      ])) as Location.LocationObject;

      const { latitude, longitude } = currentLocation.coords;
      return [longitude, latitude];
    } catch {
      return [45.494836, -73.577913];
    }
  }
}
