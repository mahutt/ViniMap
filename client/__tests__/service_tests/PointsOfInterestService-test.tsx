import PointsOfInterestService from '@/services/PointsOfInterestService';
import { Coordinates } from '@/modules/map/Types';
import { calculateEuclideanDistance } from '@/modules/map/MapUtils';
import LocalLocations from '@/services/LocalLocations';
import poiData from '@/data/PointsOfInterest.json';

// Mock dependencies
jest.mock('@/modules/map/MapUtils', () => ({
  calculateEuclideanDistance: jest.fn(),
}));

jest.mock('@/data/PointsOfInterest.json', () => ({
  pointsOfInterest: [
    {
      id: '1',
      name: 'Test POI 1',
      type: 'restaurant',
      coordinates: { lat: 40.7128, lng: -74.006 },
      address: '123 Test St',
      openingHours: { isOpen: true, hours: '9-5' },
      description: 'Test description 1',
    },
    {
      id: '2',
      name: 'Test POI 2',
      type: 'park',
      coordinates: { lat: 40.7138, lng: -74.016 },
      address: '456 Test Ave',
      openingHours: { isOpen: false, hours: '10-6' },
      description: 'Test description 2',
    },
    {
      id: '3',
      name: 'Test POI 3',
      type: 'restaurant',
      coordinates: { lat: 40.7148, lng: -74.026 },
      address: '789 Test Blvd',
      openingHours: { isOpen: true, hours: '8-10' },
      description: null,
    },
  ],
}));

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
        expect(localLocationsInstance.add).toHaveBeenCalledTimes(3);

        // Test one call to verify the correct callback function
        const firstCall = (localLocationsInstance.add as jest.Mock).mock.calls[0];
        expect(firstCall[0]).toBe('Test POI 1');

        // Call the callback to ensure it transforms data correctly
        const callback = firstCall[1];
        const result = callback('Test POI 1');
        expect(result).toEqual({
          name: 'Test POI 1',
          coordinates: { lat: 40.7128, lng: -74.006 },
          data: {
            address: '123 Test St',
            isOpen: true,
            hours: '9-5',
            description: 'Test description 1',
          },
        });
      });
    });
  });

  describe('getAllPOIs', () => {
    it('should return all points of interest', () => {
      const allPOIs = PointsOfInterestService.getAllPOIs();
      expect(allPOIs).toEqual(poiData.pointsOfInterest);
      expect(allPOIs.length).toBe(3);
    });
  });

  describe('getPOIsByType', () => {
    it('should return POIs filtered by type', () => {
      const restaurants = PointsOfInterestService.getPOIsByType('restaurant');
      expect(restaurants.length).toBe(2);
      expect(restaurants[0].id).toBe('1');
      expect(restaurants[1].id).toBe('3');
    });

    it('should return empty array if no POIs of given type exist', () => {
      const hospitals = PointsOfInterestService.getPOIsByType('hospital');
      expect(hospitals).toEqual([]);
    });
  });

  describe('findClosestPOI', () => {
    it('should return the closest POI within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];

      // Mock distance calculations for each POI
      (calculateEuclideanDistance as jest.Mock).mockImplementation((coords, poiCoords) => {
        if (poiCoords.lat === 40.7128 && poiCoords.lng === -74.006) return 0.0002; // POI 1 (closest)
        if (poiCoords.lat === 40.7138 && poiCoords.lng === -74.016) return 0.0004; // POI 2
        if (poiCoords.lat === 40.7148 && poiCoords.lng === -74.026) return 0.0008; // POI 3 (outside radius)
        return 1; // Default
      });

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest).toEqual(poiData.pointsOfInterest[0]);
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
        if (poiCoords.lat === 40.7128 && poiCoords.lng === -74.006) return 0.0003; // Within default radius
        return 0.001; // Outside default radius
      });

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates);
      expect(closest).toEqual(poiData.pointsOfInterest[0]);
    });

    it('should select the closest POI when multiple are within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];

      // Mock multiple POIs within radius but with different distances
      (calculateEuclideanDistance as jest.Mock).mockImplementation((coords, poiCoords) => {
        if (poiCoords.lat === 40.7128 && poiCoords.lng === -74.006) return 0.0003; // POI 1
        if (poiCoords.lat === 40.7138 && poiCoords.lng === -74.016) return 0.0002; // POI 2 (closest)
        if (poiCoords.lat === 40.7148 && poiCoords.lng === -74.026) return 0.0004; // POI 3
        return 1; // Default
      });

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest).toEqual(poiData.pointsOfInterest[1]);
    });
  });

  describe('getPOIById', () => {
    it('should return a POI by ID if it exists', () => {
      const poi = PointsOfInterestService.getPOIById('2');
      expect(poi).toEqual(poiData.pointsOfInterest[1]);
    });

    it('should return undefined if POI with given ID does not exist', () => {
      const poi = PointsOfInterestService.getPOIById('nonexistent');
      expect(poi).toBeUndefined();
    });
  });

  describe('shouldShowPOIs', () => {
    it('should return true when zoom level is >= 15', () => {
      expect(PointsOfInterestService.shouldShowPOIs(15)).toBe(true);
      expect(PointsOfInterestService.shouldShowPOIs(16)).toBe(true);
      expect(PointsOfInterestService.shouldShowPOIs(20)).toBe(true);
    });

    it('should return false when zoom level is < 15', () => {
      expect(PointsOfInterestService.shouldShowPOIs(14)).toBe(false);
      expect(PointsOfInterestService.shouldShowPOIs(10)).toBe(false);
      expect(PointsOfInterestService.shouldShowPOIs(0)).toBe(false);
    });
  });
});
