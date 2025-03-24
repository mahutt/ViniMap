import PointsOfInterestService from '@/services/PointsOfInterestService';
import { Coordinates } from '@/modules/map/Types';
import { calculateEuclideanDistance } from '@/modules/map/MapUtils';
import LocalLocations from '@/services/LocalLocations';
import type { FeatureCollection, Point } from 'geojson';

// Mock dependencies
jest.mock('@/modules/map/MapUtils', () => ({
  calculateEuclideanDistance: jest.fn(),
}));

jest.mock(
  '@/assets/geojson/pois.json',
  (): FeatureCollection<Point> => ({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Test POI 1',
          addr: '123 Test St',
          opening_hours: '9-5',
          description: 'Test description 1',
          amenity: 'restaurant',
        },
        geometry: {
          type: 'Point',
          coordinates: [-74.006, 40.7128],
        },
      },
      {
        type: 'Feature',
        properties: {
          name: 'Test POI 2',
          addr: '456 Test Ave',
          opening_hours: '10-6',
          description: 'Test description 2',
          amenity: 'park',
        },
        geometry: {
          type: 'Point',
          coordinates: [-74.016, 40.7138],
        },
      },
      {
        type: 'Feature',
        properties: {
          addr: '789 Test Blvd',
          opening_hours: '8-10',
          description: 'Public restaurant',
          amenity: 'restaurant',
        },
        geometry: {
          type: 'Point',
          coordinates: [-74.026, 40.7148],
        },
      },
    ],
  })
);

jest.mock('@/services/LocalLocations', () => {
  const mockInstance = {
    add: jest.fn(),
  };
  return {
    getInstance: jest.fn(() => mockInstance),
  };
});

describe('PointsOfInterestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize LocalLocations with all POIs from data', () => {
      // Re-import the service to trigger the initialization code
      jest.isolateModules(() => {
        require('@/services/PointsOfInterestService');

        const localLocationsInstance = LocalLocations.getInstance();
        expect(localLocationsInstance.add).toHaveBeenCalledTimes(2); // Test POI 3 doesn't have a name property

        // Test one call to verify the correct callback function
        const firstCall = (localLocationsInstance.add as jest.Mock).mock.calls[0];
        expect(firstCall[0]).toBe('Test POI 1');

        // Call the callback to ensure it transforms data correctly
        const callback = firstCall[1];
        const result = callback('Test POI 1');
        expect(result).toEqual({
          name: 'Test POI 1',
          coordinates: [-74.006, 40.7128],
          data: {
            address: '123 Test St',
            isOpen: true,
            hours: '9-5',
            description: 'Test description 1',
            type: 'restaurant',
          },
        });
      });
    });
  });

  describe('findClosestPOI', () => {
    it('should return the closest POI within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];

      // Mock distance calculations for each POI
      (calculateEuclideanDistance as jest.Mock).mockImplementation((coords, poiCoords) => {
        if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0002; // POI 1 (closest)
        if (poiCoords[1] === 40.7138 && poiCoords[0] === -74.016) return 0.0004; // POI 2
        if (poiCoords[1] === 40.7148 && poiCoords[0] === -74.026) return 0.0008; // POI 3 (outside radius)
        return 1; // Default
      });

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest).toEqual({
        name: 'Test POI 1',
        coordinates: [-74.006, 40.7128],
        data: {
          address: '123 Test St',
          description: 'Test description 1',
          hours: '9-5',
          isOpen: true,
          type: 'restaurant',
        },
      });
      expect(calculateEuclideanDistance).toHaveBeenCalledTimes(3);
    });

    it('should return null if no POIs are within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];

      // Mock all distances to be beyond radius
      (calculateEuclideanDistance as jest.Mock).mockReturnValue(0.001);

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest).toBeNull();
    });

    it('should use default radius if none provided', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];

      // Mock distance calculations
      (calculateEuclideanDistance as jest.Mock).mockImplementation((coords, poiCoords) => {
        if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0003; // Within default radius
        return 0.001;
      });

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates);
      expect(closest).toEqual({
        name: 'Test POI 1',
        coordinates: [-74.006, 40.7128],
        data: {
          address: '123 Test St',
          description: 'Test description 1',
          hours: '9-5',
          isOpen: true,
          type: 'restaurant',
        },
      });
    });

    it('should select the closest POI when multiple are within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];

      // Mock multiple POIs within radius but with different distances
      (calculateEuclideanDistance as jest.Mock).mockImplementation((coords, poiCoords) => {
        if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0003; // POI 1
        if (poiCoords[1] === 40.7138 && poiCoords[0] === -74.016) return 0.0002; // POI 2 (closest)
        if (poiCoords[1] === 40.7148 && poiCoords[0] === -74.026) return 0.0004; // POI 3
        return 1; // Default
      });

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest).toEqual({
        name: 'Test POI 2',
        coordinates: [-74.016, 40.7138],
        data: {
          address: '456 Test Ave',
          description: 'Test description 2',
          hours: '10-6',
          isOpen: true,
          type: 'park',
        },
      });
    });
  });
});
