import PointsOfInterestService from '@/services/PointsOfInterestService';
import { Coordinates } from '@/modules/map/Types';
import { calculateEuclideanDistance } from '@/modules/map/MapUtils';
import LocalLocations from '@/services/LocalLocations';
import type { FeatureCollection, Point } from 'geojson';

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
      {
        type: 'Feature',
        properties: {
          name: 'Weekend Evening POI',
          addr: '999 Test Ave',
          opening_hours: 'Fr-Su 18:00-24:00',
          description: 'Night venue',
          amenity: 'bar',
        },
        geometry: {
          type: 'Point',
          coordinates: [-74.036, 40.7158],
        },
      },
      {
        type: 'Feature',
        properties: {
          name: 'Wrapped Days POI',
          addr: '888 Test Ave',
          opening_hours: 'Su,Tu-Fr 09:00-17:00',
          description: 'Wrapped days test',
          amenity: 'cafe',
        },
        geometry: {
          type: 'Point',
          coordinates: [-74.046, 40.7168],
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

  afterEach(() => {
    global.Date = originalDate;
  });

  describe('initialization', () => {
    it('initializes LocalLocations with POIs that have names', () => {
      jest.isolateModules(() => {
        require('@/services/PointsOfInterestService');
        const localLocationsInstance = LocalLocations.getInstance();
        expect(localLocationsInstance.add).toHaveBeenCalledTimes(5);
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
    });

    it('returns null if no POIs are within radius', () => {
      const userCoordinates: Coordinates = [-74.007, 40.713];
      (calculateEuclideanDistance as jest.Mock).mockReturnValue(0.001);

      const closest = PointsOfInterestService.findClosestPOI(userCoordinates, 0.0005);
      expect(closest).toBeNull();
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
      global.Date = jest.fn(() => new Date(2025, 3, 7, 12, 0)) as unknown as typeof Date;
      const poi = PointsOfInterestService.getPOIByName('Test POI 1');
      expect(poi?.data.isOpen).toBe(true);
    });

    it('handles weekday closed hours', () => {
      global.Date = jest.fn(() => new Date(2025, 3, 7, 18, 0)) as unknown as typeof Date;
      const poi = PointsOfInterestService.getPOIByName('Test POI 1');
      expect(poi?.data.isOpen).toBe(false);
    });

    it('handles weekend open hours', () => {
      global.Date = jest.fn(() => new Date(2025, 3, 12, 12, 0)) as unknown as typeof Date;
      const poi = PointsOfInterestService.getPOIByName('Test POI 2');
      expect(poi?.data.isOpen).toBe(true);
    });

    it('handles 24/7 locations', () => {
      global.Date = jest.fn(() => new Date(2025, 3, 8, 3, 30)) as unknown as typeof Date;
      const poi = PointsOfInterestService.getPOIByName('Test POI 3');
      expect(poi?.data.isOpen).toBe(true);
    });

    it('handles non-standard day ranges', () => {
      global.Date = jest.fn(() => new Date(2025, 3, 13, 12, 0)) as unknown as typeof Date;
      const poi = PointsOfInterestService.getPOIByName('Wrapped Days POI');
      expect(poi?.data.isOpen).toBe(true);
    });

    it('handles evening hours', () => {
      global.Date = jest.fn(() => new Date(2025, 3, 11, 20, 0)) as unknown as typeof Date;
      const poi = PointsOfInterestService.getPOIByName('Weekend Evening POI');
      expect(poi?.data.isOpen).toBe(true);
    });

    it('handles null opening hours', () => {
      const testFeature = {
        type: 'Feature',
        properties: {
          name: 'No Hours POI',
          addr: '555 Test Ave',
          description: 'No hours test',
          amenity: 'cafe',
        },
        geometry: {
          type: 'Point',
          coordinates: [-74.056, 40.7178],
        },
      };

      const location = (PointsOfInterestService as any).extractLocation(testFeature);
      expect(location.data.isOpen).toBe(false);
    });
  });

  describe('isCurrentDayInRange', () => {
    it('handles invalid day codes', () => {
      global.Date = jest.fn(() => new Date(2025, 3, 7, 12, 0)) as unknown as typeof Date;
      const testPoi = (PointsOfInterestService as any).isCurrentDayInRange('InvalidDay', 'Mo-Fr');
      expect(testPoi).toBe(false);
    });

    it('handles invalid day range', () => {
      global.Date = jest.fn(() => new Date(2025, 3, 7, 12, 0)) as unknown as typeof Date;
      const testPoi = (PointsOfInterestService as any).isCurrentDayInRange('Mo', 'XX-YY');
      expect(testPoi).toBe(false);
    });
  });

  describe('isInDayRange', () => {
    it('handles standard day ranges', () => {
      const result = (PointsOfInterestService as any).isInDayRange(2, 1, 5);
      expect(result).toBe(true);
    });

    it('handles wrapped day ranges', () => {
      const result = (PointsOfInterestService as any).isInDayRange(0, 5, 1);
      expect(result).toBe(true);
    });
  });
});
