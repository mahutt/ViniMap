import CoordinateService from '@/services/CoordinateService';
import * as Location from 'expo-location';

// Mock the entire expo-location module
jest.mock('expo-location');

const mockedLocation = Location as jest.Mocked<typeof Location>;

describe('CoordinateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should return coordinates when permissions are granted', async () => {
    // Mock the required Location methods with successful responses
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted' as Location.PermissionStatus,
      granted: true,
      expires: 'never',
      canAskAgain: true,
    });

    mockedLocation.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });

    const coordinates = await CoordinateService.getCurrentCoordinates();

    expect(coordinates).toEqual([-122.4194, 37.7749]);
    expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockedLocation.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
    expect(mockedLocation.getCurrentPositionAsync).toHaveBeenCalledWith({});
  });

  it('should return fallback coordinates when permissions are denied', async () => {
    // Mock permissions being denied
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied' as Location.PermissionStatus,
      granted: false,
      expires: 'never',
      canAskAgain: true,
    });

    const coordinates = await CoordinateService.getCurrentCoordinates();

    expect(coordinates).toEqual([-73.577913, 45.494836]);
    expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockedLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('should return fallback coordinates when Location.getCurrentPositionAsync throws an error', async () => {
    // Mock permissions granted but getCurrentPositionAsync throws
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted' as Location.PermissionStatus,
      granted: true,
      expires: 'never',
      canAskAgain: true,
    });

    mockedLocation.getCurrentPositionAsync.mockRejectedValue(new Error('Location error'));

    const coordinates = await CoordinateService.getCurrentCoordinates();

    expect(coordinates).toEqual([-73.577913, 45.494836]);
    expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockedLocation.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('should return fallback coordinates when Location.requestForegroundPermissionsAsync throws an error', async () => {
    // Mock requestForegroundPermissionsAsync throwing an error
    mockedLocation.requestForegroundPermissionsAsync.mockRejectedValue(
      new Error('Permission error')
    );

    const coordinates = await CoordinateService.getCurrentCoordinates();

    expect(coordinates).toEqual([-73.577913, 45.494836]);
    expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockedLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('should return fallback coordinates when location retrieval times out', async () => {
    // Timeout for the test
    jest.setTimeout(10000);
    // Mocking the permission request as granted
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted' as Location.PermissionStatus,
      granted: true,
      expires: 'never',
      canAskAgain: true,
    });

    const promiseRejectionCallback = (_: any, reject: (reason?: any) => void) => {
      // Simulating a delay that exceeds the test timeout
      setTimeout(() => reject(new Error('Location retrieval timed out')), 6000); // 6 seconds for the timeout
    };
    const simulateLocationTimeout: () => Promise<Location.LocationObject> = () =>
      new Promise(promiseRejectionCallback);

    // Mock the location retrieval to simulate a timeout
    mockedLocation.getCurrentPositionAsync.mockImplementation(simulateLocationTimeout);

    // Testing the behavior when the timeout occurs
    const coordinates = await CoordinateService.getCurrentCoordinates();
    expect(coordinates).toEqual([-73.577913, 45.494836]);
  });

  it('should handle timeout for location retrieval', async () => {
    mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted' as Location.PermissionStatus,
      granted: true,
      expires: 'never',
      canAskAgain: true,
    });

    mockedLocation.getCurrentPositionAsync.mockImplementation();

    const coordinates = await CoordinateService.getCurrentCoordinates();

    expect(coordinates).toEqual([-73.577913, 45.494836]);
    expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockedLocation.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
  });

  describe('calculateRouteCoordinateBounds', () => {
    it('should calculate correct bounds for a route with multiple segments', () => {
      const route = {
        duration: 1200,
        distance: 5000,
        segments: [
          {
            steps: [
              [10, 20],
              [30, 40],
            ],
          },
          {
            steps: [
              [5, 15],
              [25, 35],
            ],
          },
        ],
      };

      const bounds = CoordinateService.calculateRouteCoordinateBounds(route as any);

      expect(bounds).toEqual({
        ne: [30, 40],
        sw: [5, 15],
      });
    });

    it('should handle a route with a single segment', () => {
      const route = {
        duration: 600,
        distance: 2500,
        segments: [
          {
            steps: [
              [10, 20],
              [30, 40],
            ],
          },
        ],
      };

      const bounds = CoordinateService.calculateRouteCoordinateBounds(route as any);

      expect(bounds).toEqual({
        ne: [30, 40],
        sw: [10, 20],
      });
    });

    it('should handle a route with a single coordinate', () => {
      const route = {
        duration: 0,
        distance: 0,
        segments: [
          {
            steps: [[10, 20]],
          },
        ],
      };

      const bounds = CoordinateService.calculateRouteCoordinateBounds(route as any);

      expect(bounds).toEqual({
        ne: [10, 20],
        sw: [10, 20],
      });
    });

    it('should handle an empty route correctly', () => {
      const route = {
        duration: 0,
        distance: 0,
        segments: [
          {
            steps: [],
          },
        ],
      };

      const bounds = CoordinateService.calculateRouteCoordinateBounds(route as any);

      expect(bounds).toEqual({
        ne: [-180, -90],
        sw: [180, 90],
      });
    });
  });
});
