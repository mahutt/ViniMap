import * as Location from 'expo-location';

type Coordinates = [number, number];

export default class CoordinateService {
  static async getCurrentCoordinates(): Promise<Coordinates | null> {
    try {
      console.log('Requesting location permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();

      console.log('Permission Status:', status);
      if (status !== 'granted') {
        console.log('Location permissions not granted');
        return null;
      }

      console.log('Checking location services...');
      const serviceStatus = await Location.getProviderStatusAsync();
      console.log('Location Services Status:', JSON.stringify(serviceStatus));

      console.log('Attempting to get current position...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;

      console.log('Location Successfully Retrieved:');
      console.log(`Latitude: ${latitude}`);
      console.log(`Longitude: ${longitude}`);
      console.log('Full Location Object:', JSON.stringify(currentLocation, null, 2));

      return [longitude, latitude];
    } catch (error) {
      console.error('Detailed Location Error:', error);
      // If you want to see the full error object
      console.error('Error Details:', JSON.stringify(error, null, 2));
      return null;
    }
  }
}
