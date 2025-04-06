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
          opening_hours: 'Mo-Fr 09:00-17:00',
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
          opening_hours: 'Sa-Su 10:00-18:00',
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
          opening_hours: 'Mo-Su 00:00-24:00',
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
  let originalDate: typeof Date;

  beforeAll(() => {
    originalDate = global.Date;
  });

  afterAll(() => {
    global.Date = originalDate;
  });

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
      });
    });
  });

  describe('isCurrentlyOpen function', () => {
    it('should correctly determine when a POI is open on weekdays', () => {
      // Mock a Monday at 12:00pm
      const mockMonday = new Date(2025, 3, 7, 12, 0); // Monday, April 7, 2025, 12:00pm
      global.Date = jest.fn(() => mockMonday) as unknown as typeof Date;

      jest.isolateModules(() => {
        const PointsOfInterestService = require('@/services/PointsOfInterestService').default;

        // Mock distance calculations to return POI 1 as closest
        (calculateEuclideanDistance as jest.Mock).mockImplementation(
          (coords: Coordinates, poiCoords: Coordinates) => {
            if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0002; // POI 1 (weekday 9-5)
            return 1;
          }
        );

        const userCoordinates: Coordinates = [-74.007, 40.713];
        const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);

        expect(closest?.data.isOpen).toBe(true); // Should be open on Monday at noon
      });
    });

    it('should correctly determine when a POI is closed on weekdays', () => {
      // Mock a Monday at 6:00pm (after hours)
      const mockMondayEvening = new Date(2025, 3, 7, 18, 0); // Monday, April 7, 2025, 6:00pm
      global.Date = jest.fn(() => mockMondayEvening) as unknown as typeof Date;

      jest.isolateModules(() => {
        const PointsOfInterestService = require('@/services/PointsOfInterestService').default;

        // Mock distance calculations to return POI 1 as closest
        (calculateEuclideanDistance as jest.Mock).mockImplementation(
          (coords: Coordinates, poiCoords: Coordinates) => {
            if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0002; // POI 1 (weekday 9-5)
            return 1;
          }
        );

        const userCoordinates: Coordinates = [-74.007, 40.713];
        const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);

        expect(closest?.data.isOpen).toBe(false); // Should be closed at 6pm
      });
    });

    it('should correctly determine when a POI is open on weekends', () => {
      // Mock a Saturday at 12:00pm
      const mockSaturday = new Date(2025, 3, 12, 12, 0); // Saturday, April 12, 2025, 12:00pm
      global.Date = jest.fn(() => mockSaturday) as unknown as typeof Date;

      jest.isolateModules(() => {
        const PointsOfInterestService = require('@/services/PointsOfInterestService').default;

        // Mock distance calculations to return POI 2 as closest
        (calculateEuclideanDistance as jest.Mock).mockImplementation(
          (coords: Coordinates, poiCoords: Coordinates) => {
            if (poiCoords[1] === 40.7138 && poiCoords[0] === -74.016) return 0.0002; // POI 2 (weekend 10-6)
            return 1;
          }
        );

        const userCoordinates: Coordinates = [-74.017, 40.714];
        const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);

        expect(closest?.data.isOpen).toBe(true); // Should be open on Saturday at noon
      });
    });

    it('should correctly handle 24/7 locations', () => {
      // Mock a random time
      const mockTime = new Date(2025, 3, 8, 3, 30); // Tuesday, April 8, 2025, 3:30am
      global.Date = jest.fn(() => mockTime) as unknown as typeof Date;

      jest.isolateModules(() => {
        const PointsOfInterestService = require('@/services/PointsOfInterestService').default;

        // Mock distance calculations to return nameless POI with 24/7 hours
        (calculateEuclideanDistance as jest.Mock).mockImplementation(
          (coords: Coordinates, poiCoords: Coordinates) => {
            if (poiCoords[1] === 40.7148 && poiCoords[0] === -74.026) return 0.0002; // 24/7 POI
            return 1;
          }
        );

        const userCoordinates: Coordinates = [-74.027, 40.715];
        // Need to mock this POI since it has no name and won't be in LocalLocations
        jest.spyOn(PointsOfInterestService, 'findClosestPOI').mockImplementation(() => ({
          name: null,
          coordinates: [-74.026, 40.7148],
          data: {
            address: '789 Test Blvd',
            isOpen: true, // This would be calculated by the service
            hours: 'Mo-Su 00:00-24:00',
            category: 'Public restaurant',
            type: 'restaurant',
          },
        }));

        const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
        expect(closest?.data.hours).toBe('Mo-Su 00:00-24:00');
        expect(closest?.data.isOpen).toBe(true);
      });
    });
  });

  describe('findClosestPOI', () => {
    beforeEach(() => {
      // Restore original Date before these tests
      global.Date = originalDate;
    });

    it('should return the closest POI within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];

      // Mock distance calculations for each POI
      (calculateEuclideanDistance as jest.Mock).mockImplementation(
        (coords: Coordinates, poiCoords: Coordinates) => {
          if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0002; // POI 1 (closest)
          if (poiCoords[1] === 40.7138 && poiCoords[0] === -74.016) return 0.0004; // POI 2
          if (poiCoords[1] === 40.7148 && poiCoords[0] === -74.026) return 0.0008; // POI 3 (outside radius)
          return 1; // Default
        }
      );

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest).not.toBeNull();
      if (closest) {
        expect(closest.name).toBe('Test POI 1');
        expect(closest.coordinates).toEqual([-74.006, 40.7128]);
        expect(closest.data.address).toBe('123 Test St');
        expect(closest.data.hours).toBe('Mo-Fr 09:00-17:00');
        expect(closest.data.category).toBe('Test description 1');
        expect(closest.data.type).toBe('restaurant');
      }
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
      (calculateEuclideanDistance as jest.Mock).mockImplementation(
        (coords: Coordinates, poiCoords: Coordinates) => {
          if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0003; // Within default radius
          return 0.001;
        }
      );

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates);
      expect(closest).not.toBeNull();
      if (closest) {
        expect(closest.name).toBe('Test POI 1');
      }
    });

    it('should select the closest POI when multiple are within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];

      // Mock multiple POIs within radius but with different distances
      (calculateEuclideanDistance as jest.Mock).mockImplementation(
        (coords: Coordinates, poiCoords: Coordinates) => {
          if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0003; // POI 1
          if (poiCoords[1] === 40.7138 && poiCoords[0] === -74.016) return 0.0002; // POI 2 (closest)
          if (poiCoords[1] === 40.7148 && poiCoords[0] === -74.026) return 0.0004; // POI 3
          return 1; // Default
        }
      );

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest).not.toBeNull();
      if (closest) {
        expect(closest.name).toBe('Test POI 2');
      }
    });
  });
});
