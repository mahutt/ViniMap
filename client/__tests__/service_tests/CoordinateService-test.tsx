import CoordinateService from '@/services/CoordinateService';
import * as Location from 'expo-location';

// Mock the entire expo-location module
jest.mock('expo-location');

const mockedLocation = Location as jest.Mocked<typeof Location>;

describe('CoordinateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
