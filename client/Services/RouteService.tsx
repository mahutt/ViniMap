import { getRoute } from '@/modules/map/MapService';
import { Coordinates } from '@/Types/Coordinate';
import ShuttleCalculatorService from '../Services/ShuttleCalculatorService';

class RouteService {
  private static readonly GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY as string;

  static async distanceOf2Coords(coord1: Coordinates, coord2: Coordinates): Promise<number> {
    const origin = `${coord1[1]},${coord1[0]}`;
    const destination = `${coord2[1]},${coord2[0]}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${this.GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const distanceValue = data.rows[0].elements[0].distance.value;
        return Number(distanceValue / 1000);
      } else {
        console.error('Error fetching distance:', data);
        return -1;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      return -1;
    }
  }

  static async getShuttleProximity(
    startCoordinates: Coordinates,
    endCoordinates: Coordinates
  ): Promise<[boolean, boolean, boolean, boolean]> {
    const MAX_DISTANCE_FROM_BUS = 1.5;

    const SgwCoords: Coordinates = [-73.5784711, 45.4970661];
    const LoyolaCoords: Coordinates = [-73.6393324, 45.4577857];

    const distanceToShuttleSgwFromStart = await RouteService.distanceOf2Coords(
      SgwCoords,
      startCoordinates
    );
    const distanceToShuttleLoyolaFromStart = await RouteService.distanceOf2Coords(
      LoyolaCoords,
      startCoordinates
    );
    const distanceToShuttleSgwFromEnd = await RouteService.distanceOf2Coords(
      SgwCoords,
      endCoordinates
    );
    const distanceToShuttleLoyolaFromEnd = await RouteService.distanceOf2Coords(
      LoyolaCoords,
      endCoordinates
    );

    const isStartSgw = distanceToShuttleSgwFromStart <= MAX_DISTANCE_FROM_BUS;
    const isStartLoyola = distanceToShuttleLoyolaFromStart <= MAX_DISTANCE_FROM_BUS;
    const isEndSgw = distanceToShuttleSgwFromEnd <= MAX_DISTANCE_FROM_BUS;
    const isEndLoyola = distanceToShuttleLoyolaFromEnd <= MAX_DISTANCE_FROM_BUS;

    return [isStartSgw, isStartLoyola, isEndSgw, isEndLoyola];
  }

  static async getRouteForShuttle(
    startCoordinates: Coordinates,
    endCoordinates: Coordinates
  ): Promise<{
    coordinates: Coordinates[] | null;
    duration: number | null;
    distance: number | null;
  }> {
    const MAX_DISTANCE_FROM_BUS = 1.5;

    const SgwCoords: Coordinates = [-73.5784711, 45.4970661];
    const LoyolaCoords: Coordinates = [-73.6393324, 45.4577857];

    let startBusStop: Coordinates = [0, 0];
    let endBusStop: Coordinates = [0, 0];

    let isStartSgw = false;
    let isStartLoyola = false;
    let isEndSgw = false;
    let isEndLoyola = false;

    const distanceToShuttleSgwFromStart = await RouteService.distanceOf2Coords(
      SgwCoords,
      startCoordinates
    );
    const distanceToShuttleLoyolaFromStart = await RouteService.distanceOf2Coords(
      LoyolaCoords,
      startCoordinates
    );
    const distanceToShuttleSgwFromEnd = await RouteService.distanceOf2Coords(
      SgwCoords,
      endCoordinates
    );
    const distanceToShuttleLoyolaFromEnd = await RouteService.distanceOf2Coords(
      LoyolaCoords,
      endCoordinates
    );

    if (distanceToShuttleSgwFromStart <= MAX_DISTANCE_FROM_BUS) {
      isStartSgw = true;
      startBusStop = SgwCoords;
    }
    if (distanceToShuttleLoyolaFromStart <= MAX_DISTANCE_FROM_BUS) {
      isStartLoyola = true;
      startBusStop = LoyolaCoords;
    }
    if (distanceToShuttleSgwFromEnd <= MAX_DISTANCE_FROM_BUS) {
      isEndSgw = true;
      endBusStop = SgwCoords;
    }
    if (distanceToShuttleLoyolaFromEnd <= MAX_DISTANCE_FROM_BUS) {
      isEndLoyola = true;
      endBusStop = LoyolaCoords;
    }

    if ((isStartSgw || isStartLoyola) && (isEndSgw || isEndLoyola)) {
      const start_Walk_ShuttleStart = await getRoute(startCoordinates, startBusStop, 'walking');

      const shuttleStart_Drive_shuttleEnd = await getRoute(startBusStop, endBusStop, 'driving');

      const shuttleEnd_Walk_end = await getRoute(endBusStop, endCoordinates, 'walking');

      const middleCoords: Coordinates[] = (start_Walk_ShuttleStart.coordinates ?? []).concat(
        shuttleStart_Drive_shuttleEnd.coordinates ?? []
      );
      const finalCoords: Coordinates[] = middleCoords.concat(shuttleEnd_Walk_end.coordinates ?? []);

      const daysMap: { [key: number]: string } = {
        1: 'Monday-Thursday',
        2: 'Monday-Thursday',
        3: 'Monday-Thursday',
        4: 'Monday-Thursday',
        5: 'Friday',
      };
      const today = new Date().getDay();
      const dayKey = daysMap[today] ?? 'Monday-Thursday';
      const currentTime = ShuttleCalculatorService.getCurrentTime();

      const departureCampus: 'LOY' | 'SGW' = isStartSgw ? 'SGW' : 'LOY';
      const nextShuttleDuration = ShuttleCalculatorService.getNextDepartureTime(
        dayKey,
        currentTime,
        departureCampus
      );

      const shuttleDurationInSeconds =
        Number(nextShuttleDuration.replace('m', '').replace('h', '')) *
        (nextShuttleDuration.includes('h') ? 3600 : 60);

      if (isNaN(Number(shuttleDurationInSeconds))) {
        return { coordinates: null, duration: null, distance: null };
      }

      const finalDuration =
        Number(start_Walk_ShuttleStart.duration) +
        Number(shuttleStart_Drive_shuttleEnd.duration) +
        Number(shuttleEnd_Walk_end.duration) +
        shuttleDurationInSeconds;

      const finalDistance =
        Number(start_Walk_ShuttleStart.distance) +
        Number(shuttleStart_Drive_shuttleEnd.distance) +
        Number(shuttleEnd_Walk_end.distance);

      return {
        coordinates: finalCoords,
        duration: finalDuration,
        distance: finalDistance,
      };
    }

    return { coordinates: null, duration: null, distance: null };
  }

  public static readonly formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'Unavailable';
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes} min`;
  };

  
}

export default RouteService;
