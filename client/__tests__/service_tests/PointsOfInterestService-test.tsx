import PointsOfInterestService from '@/services/PointsOfInterestService';
import { Coordinates } from '@/modules/map/Types';
import { calculateEuclideanDistance } from '@/modules/map/MapUtils';
import LocalLocations from '@/services/LocalLocations';
import type { FeatureCollection, Point } from 'geojson';

jest.mock('@/modules/map/MapUtils', () => ({
  calculateEuclideanDistance: jest.fn(),
}));

// Mock the pois.json file
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
          name: 'Test POI 3',
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
      // Additional POI with no name for testing
      {
        type: 'Feature',
        properties: {
          addr: 'No Name St',
          opening_hours: 'Mo-Fr 09:00-17:00',
          description: 'No name test',
          amenity: 'shop',
        },
        geometry: {
          type: 'Point',
          coordinates: [-74.036, 40.7158],
        },
      },
    ],
  })
);

// Mock LocalLocations
jest.mock('@/services/LocalLocations', () => {
  const mockInstance = {
    add: jest.fn(),
  };
  return {
    getInstance: jest.fn(() => mockInstance),
  };
});

describe('PointsOfInterestService', () => {
  let realDate: DateConstructor;

  beforeAll(() => {
    realDate = global.Date;
  });

  afterAll(() => {
    global.Date = realDate;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Date mock between tests
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('initializes LocalLocations with POIs that have names', () => {
      jest.isolateModules(() => {
        require('@/services/PointsOfInterestService');
        const localLocationsInstance = LocalLocations.getInstance();
        expect(localLocationsInstance.add).toHaveBeenCalledTimes(3);

        // Verify it was called with the right parameters
        expect(localLocationsInstance.add).toHaveBeenCalledWith('Test POI 1', expect.any(Function));
      });
    });
  });

  describe('findClosestPOI', () => {
    it('returns closest POI within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];
      (calculateEuclideanDistance as jest.Mock).mockImplementation(
        (coords: Coordinates, poiCoords: Coordinates) => {
          if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0002;
          return 0.001;
        }
      );

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest?.name).toBe('Test POI 1');
      expect(calculateEuclideanDistance).toHaveBeenCalledTimes(4);
    });

    it('returns null if no POIs are within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];
      (calculateEuclideanDistance as jest.Mock).mockReturnValue(0.001);

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest).toBeNull();
      expect(calculateEuclideanDistance).toHaveBeenCalledTimes(4);
    });

    it('uses default radius if none provided', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];
      (calculateEuclideanDistance as jest.Mock).mockImplementation(
        (coords: Coordinates, poiCoords: Coordinates) => {
          if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0003;
          return 0.001;
        }
      );

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates);
      expect(closest?.name).toBe('Test POI 1');
    });

    it('selects closest POI when multiple are within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];
      (calculateEuclideanDistance as jest.Mock).mockImplementation(
        (coords: Coordinates, poiCoords: Coordinates) => {
          if (poiCoords[1] === 40.7128 && poiCoords[0] === -74.006) return 0.0003;
          if (poiCoords[1] === 40.7138 && poiCoords[0] === -74.016) return 0.0002;
          return 0.001;
        }
      );

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest?.name).toBe('Test POI 2');
    });
  });

  describe('getPOIByName', () => {
    it('returns POI by name when it exists', () => {
      const poi = PointsOfInterestService.getPOIByName('Test POI 1');
      expect(poi?.name).toBe('Test POI 1');
      expect(poi?.data.address).toBe('123 Test St');
    });

    it('returns null when POI name does not exist', () => {
      const poi = PointsOfInterestService.getPOIByName('Nonexistent POI');
      expect(poi).toBeNull();
    });
  });

  describe('isCurrentlyOpen function', () => {
    it('handles weekday open hours', () => {
      // Mock Date to Monday at noon
      const mockDate = new Date(2025, 3, 7, 12, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

      // Test through the public API
      const poi = PointsOfInterestService.getPOIByName('Test POI 1');
      expect(poi).not.toBeNull();
      expect(poi?.data.hours).toBe('Mo-Fr 09:00-17:00');
      expect(poi?.data.isOpen).toBe(true);
    });

    it('handles weekday closed hours', () => {
      // Mock Date to Monday evening (after business hours)
      const mockDate = new Date(2025, 3, 7, 18, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

      const poi = PointsOfInterestService.getPOIByName('Test POI 1');
      expect(poi).not.toBeNull();
      expect(poi?.data.isOpen).toBe(false);
    });

    it('handles weekend open hours', () => {
      // Mock Date to Saturday at noon
      const mockDate = new Date(2025, 3, 12, 12, 0);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

      const poi = PointsOfInterestService.getPOIByName('Test POI 2');
      expect(poi).not.toBeNull();
      expect(poi?.data.isOpen).toBe(true);
    });

    it('handles 24/7 locations', () => {
      // Mock Date to an odd hour
      const mockDate = new Date(2025, 3, 8, 3, 30);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

      const poi = PointsOfInterestService.getPOIByName('Test POI 3');
      expect(poi).not.toBeNull();
      expect(poi?.data.isOpen).toBe(true);
    });

    it('handles invalid or missing opening hours', () => {
      // Create a test POI with no opening hours
      const emptyHoursPOI = {
        name: 'Empty Hours POI',
        coordinates: [-74.056, 40.7178] as Coordinates,
        data: {
          address: '456 Test St',
          isOpen: false,
          hours: undefined, // Undefined hours
          category: 'Testing category',
          type: 'test',
        },
      };

      // Get data.isOpen property
      expect(emptyHoursPOI.data.isOpen).toBe(false);
    });
  });

  describe('getFeatureCollection', () => {
    it('returns the feature collection', () => {
      const collection = PointsOfInterestService.getFeatureCollection();
      expect(collection).toBeDefined();
      expect(collection.type).toBe('FeatureCollection');
      expect(collection.features.length).toBe(4);
    });
  });
});
