import * as Location from 'expo-location';
import { Coordinates, Route } from '@/modules/map/Types';

export default class CoordinateService {
  static async getCurrentCoordinates(): Promise<Coordinates> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return [-73.577913, 45.494836];
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
      return [-73.577913, 45.494836];
    }
  }

  static calculateRouteCoordinateBounds(route: Route): {
    ne: number[];
    sw: number[];
  } {
    const allCoordinates = route.segments.flatMap((segment) => segment.steps);
    const bounds = allCoordinates.reduce(
      (acc, coord) => {
        return {
          ne: [Math.max(acc.ne[0], coord[0]), Math.max(acc.ne[1], coord[1])],
          sw: [Math.min(acc.sw[0], coord[0]), Math.min(acc.sw[1], coord[1])],
        };
      },
      {
        ne: [-180, -90],
        sw: [180, 90],
      }
    );
    return bounds;
  }
}
