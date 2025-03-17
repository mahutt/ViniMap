import {
  formatDuration,
  getLocations,
  getRoute,
  fetchLocationData,
  getDistanceFromPositions,
  getIndoorRoute,
} from '@/modules/map/MapService';
import fetchMock from 'jest-fetch-mock';
import ShuttleCalculatorService from '@/services/ShuttleCalculatorService';
import { calculateEuclideanDistance } from '@/modules/map/MapUtils';
import type { Feature, Polygon } from 'geojson';
import { indoorMaps } from '@/modules/map/IndoorMap';

jest.mock('@/modules/map/MapUtils', () => ({
  calculateEuclideanDistance: jest.fn(),
}));

jest.mock('@/services/ShuttleCalculatorService', () => ({
  getCurrentTime: jest.fn(),
  getNextDepartureTime: jest.fn(),
}));

describe('formatDuration', () => {
  test('should return "Unavailable" when input is null', () => {
    const result = formatDuration(null);
    expect(result).toBe('Unavailable');
  });

  test('should return "0 min" for 0 seconds', () => {
    const result = formatDuration(0);
    expect(result).toBe('0 min');
  });

  test('should return "1 min" for 60 seconds', () => {
    const result = formatDuration(60);
    expect(result).toBe('1 min');
  });

  test('should return "2 min" for 120 seconds', () => {
    const result = formatDuration(120);
    expect(result).toBe('2 min');
  });

  test('should return "59 min" for 3540 seconds (59 minutes)', () => {
    const result = formatDuration(3540);
    expect(result).toBe('59 min');
  });

  test('should return "1h 0m" for 3600 seconds (1 hour)', () => {
    const result = formatDuration(3600);
    expect(result).toBe('1h 0m');
  });

  test('should return "1h 30m" for 5400 seconds (1 hour 30 minutes)', () => {
    const result = formatDuration(5400);
    expect(result).toBe('1h 30m');
  });

  test('should return "2h 15m" for 8100 seconds (2 hours 15 minutes)', () => {
    const result = formatDuration(8100);
    expect(result).toBe('2h 15m');
  });

  test('should return "3h 0m" for 10800 seconds (3 hours)', () => {
    const result = formatDuration(10800);
    expect(result).toBe('3h 0m');
  });
});

describe('getLocations', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should return mapped locations when API returns features', async () => {
    const mockResponse = {
      features: [
        {
          properties: {
            name: 'San Francisco',
            place_formatted: 'California, USA',
          },
          geometry: {
            coordinates: [-122.4194, 37.7749],
          },
        },
        {
          properties: {
            name: 'San Jose',
            place_formatted: 'California, USA',
          },
          geometry: {
            coordinates: [-121.8863, 37.3382],
          },
        },
      ],
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const result = await getLocations('San');
    expect(result).toEqual([
      {
        name: 'San Francisco, California, USA',
        coordinates: [-122.4194, 37.7749],
      },
      {
        name: 'San Jose, California, USA',
        coordinates: [-121.8863, 37.3382],
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://api.mapbox.com/search/geocode/v6/forward?q=San')
    );
  });

  it('should handle missing place_formatted gracefully', async () => {
    const mockResponse = {
      features: [
        {
          properties: {
            name: 'San Francisco',
            // No place_formatted
          },
          geometry: {
            coordinates: [-122.4194, 37.7749],
          },
        },
      ],
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const result = await getLocations('San Francisco');
    expect(result).toEqual([
      {
        name: 'San Francisco, ',
        coordinates: [-122.4194, 37.7749],
      },
    ]);
  });

  it('should return empty array when no features are returned', async () => {
    const mockResponse = { features: [] };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const result = await getLocations('NonexistentPlace');
    expect(result).toEqual([]);
  });

  it('should return empty array when API response is invalid', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}));
    const result = await getLocations('InvalidQuery');
    expect(result).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    fetchMock.mockRejectOnce(new Error('API Error'));
    await expect(getLocations('ErrorTest')).rejects.toThrow('API Error');
  });

  it('should handle non-English characters in query', async () => {
    const mockResponse = {
      features: [
        {
          properties: {
            name: 'Café du Monde',
            place_formatted: 'Montréal, Québec',
          },
          geometry: {
            coordinates: [-73.55, 45.51],
          },
        },
      ],
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const result = await getLocations('Café');
    expect(result).toEqual([
      {
        name: 'Café du Monde, Montréal, Québec',
        coordinates: [-73.55, 45.51],
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`q=${encodeURIComponent('Café')}`)
    );
  });

  it('should properly encode complex queries with special characters', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ features: [] }));

    await getLocations('Hall Building & Library');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`q=${encodeURIComponent('Hall Building & Library')}`)
    );
  });

  it('should use proximity coordinates in the request', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ features: [] }));

    await getLocations('test');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('proximity=-73.57791396549962,45.495102086770814')
    );
  });

  describe('getRoute additional scenarios', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
    });

    it('should handle cycling mode correctly', async () => {
      const mockResponse = {
        routes: [
          {
            duration: 420,
            distance: 2500,
            geometry: {
              coordinates: [
                [-73.57, 45.49],
                [-73.58, 45.5],
                [-73.59, 45.51],
              ],
            },
          },
        ],
      };

      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const result = await getRoute(
        {
          coordinates: [-73.57, 45.49],
          name: null,
        },
        { name: null, coordinates: [-73.59, 45.51] },
        'cycling'
      );

      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('mapbox/cycling'));

      expect(result).toBeTruthy();
      if (result) {
        expect(result.segments[0].id).toBe('cycling');
        expect(result.segments[0].type).toBe('solid');
      }
    });

    it('should handle invalid response from API with missing geometry', async () => {
      const mockResponse = {
        routes: [
          {
            duration: 300,
            distance: 1200,
            geometry: {
              coordinates: [],
            },
          },
        ],
      };

      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const result = await getRoute(
        { name: null, coordinates: [-73.57, 45.49] },
        { name: null, coordinates: [-73.59, 45.51] },
        'walking'
      );
      expect(result).toBeTruthy();
      if (result) {
        expect(result.segments[0].steps).toEqual([]);
      }
    });

    it('should include correct query parameters in API request', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ routes: [] }));

      await getRoute(
        { name: null, coordinates: [-73.57, 45.49] },
        { name: null, coordinates: [-73.59, 45.51] },
        'walking'
      );

      const callUrl = fetchMock.mock.calls[0][0];
      expect(callUrl).toContain('alternatives=false');
      expect(callUrl).toContain('annotations=duration,distance');
      expect(callUrl).toContain('continue_straight=true');
      expect(callUrl).toContain('geometries=geojson');
      expect(callUrl).toContain('language=en');
      expect(callUrl).toContain('overview=full');
      expect(callUrl).toContain('steps=true');
    });
  });

  describe('fetchLocationData edge cases', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
    });

    it('should handle single result from Google API', async () => {
      const mockResponse = {
        results: [
          {
            name: 'Single Location',
          },
          {
            name: 'Second Location',
          },
        ],
      };

      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const result = await fetchLocationData([-73.57, 45.49]);

      expect(result).toBeTruthy();
      if (result) {
        expect(result.data.address).toBe('Single Location');
        expect(result.name).toBe('Second Location');
        expect(result.data.isOpen).toBe(false);
      }
    });
    it('should handle results with missing opening_hours', async () => {
      const mockResponse = {
        results: [
          {
            name: 'Location 1',
          },
          {
            name: 'Location 2',
          },
        ],
      };

      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const result = await fetchLocationData([-73.57, 45.49]);

      expect(result).toBeTruthy();
      if (result) {
        expect(result.data.address).toBe('Location 1');
        expect(result.name).toBe('Location 2');
        expect(result.data.isOpen).toBe(false);
      }
    });

    it('should use correct radius parameter in Google API request', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ results: [] }));

      await fetchLocationData([-73.57, 45.49]);

      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('radius=50'));
    });

    it('should handle undefined fields in results gracefully', async () => {
      const mockResponse = {
        results: [{}, {}],
      };

      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const result = await fetchLocationData([-73.57, 45.49]);

      expect(result).toBeTruthy();
      if (result) {
        expect(result.data.address).toBe('Address not available');
        expect(result.name).toBe('Selected Location');
      }
    });
  });

  // Integration test for shuttle route through exported API
  describe('Shuttle routing through public API', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
      jest.clearAllMocks();

      // Mock calculateEuclideanDistance to simulate locations near shuttle stops
      (calculateEuclideanDistance as jest.Mock).mockImplementation((coord1, coord2) => {
        return 0.005;
      });

      // Mock shuttle calculator service
      (ShuttleCalculatorService.getCurrentTime as jest.Mock).mockReturnValue('12:00');
      (ShuttleCalculatorService.getNextDepartureTime as jest.Mock).mockReturnValue('15m');
    });

    it('should handle full shuttle route calculation end-to-end', async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          routes: [
            {
              duration: 300,
              distance: 500,
              geometry: {
                coordinates: [
                  [-73.578, 45.497],
                  [-73.5784711, 45.4970661],
                ],
              },
            },
          ],
        })
      );

      fetchMock.mockResponseOnce(
        JSON.stringify({
          routes: [
            {
              duration: 1200,
              distance: 5000,
              geometry: {
                coordinates: [
                  [-73.5784711, 45.4970661],
                  [-73.6393324, 45.4577857],
                ],
              },
            },
          ],
        })
      );

      fetchMock.mockResponseOnce(
        JSON.stringify({
          routes: [
            {
              duration: 240,
              distance: 400,
              geometry: {
                coordinates: [
                  [-73.6393324, 45.4577857],
                  [-73.639, 45.457],
                ],
              },
            },
          ],
        })
      );
      const result = await getRoute(
        { name: null, coordinates: [-73.578, 45.497] },
        { name: null, coordinates: [-73.639, 45.457] },
        'shuttle'
      );

      expect(fetchMock.mock.calls.length).toBe(3);

      expect(result).toBeTruthy();
      if (result) {
        expect(result.segments.length).toBe(3);

        expect(result.segments[0].id).toBe('firstWalk');
        expect(result.segments[1].id).toBe('shuttle');
        expect(result.segments[2].id).toBe('secondWalk');

        expect(result.segments[0].type).toBe('dashed');
        expect(result.segments[1].type).toBe('solid');
        expect(result.segments[2].type).toBe('dashed');

        expect(result.duration).toBe(2640);
        expect(result.distance).toBe(5900);
      }
    });
  });

  it('should handle day of week mapping for shuttle schedule', async () => {
    const originalDate = global.Date;
    const mockDate = jest.fn(() => ({ getDay: () => 5 })) as unknown as typeof Date; // Friday
    mockDate.UTC = originalDate.UTC;
    mockDate.parse = originalDate.parse;
    mockDate.now = originalDate.now;
    global.Date = mockDate as any;

    fetchMock.mockResponseOnce(
      JSON.stringify({
        routes: [
          {
            duration: 300,
            distance: 500,
            geometry: { coordinates: [] },
          },
        ],
      })
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({
        routes: [
          {
            duration: 1200,
            distance: 5000,
            geometry: { coordinates: [] },
          },
        ],
      })
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({
        routes: [
          {
            duration: 240,
            distance: 400,
            geometry: { coordinates: [] },
          },
        ],
      })
    );

    await getRoute(
      { name: null, coordinates: [-73.578, 45.497] },
      { name: null, coordinates: [-73.639, 45.457] },
      'shuttle'
    );

    expect(ShuttleCalculatorService.getNextDepartureTime).toHaveBeenCalledWith(
      'Friday',
      expect.any(String),
      expect.any(String)
    );

    global.Date = originalDate;
  });

  it('should handle invalid shuttle duration response', async () => {
    (ShuttleCalculatorService.getNextDepartureTime as jest.Mock).mockReturnValue('N/A');

    fetchMock.mockResponseOnce(
      JSON.stringify({
        routes: [
          {
            duration: 300,
            distance: 500,
            geometry: { coordinates: [] },
          },
        ],
      })
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({
        routes: [
          {
            duration: 1200,
            distance: 5000,
            geometry: { coordinates: [] },
          },
        ],
      })
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({
        routes: [
          {
            duration: 240,
            distance: 400,
            geometry: { coordinates: [] },
          },
        ],
      })
    );

    const result = await getRoute(
      { name: null, coordinates: [-73.578, 45.497] },
      { name: null, coordinates: [-73.639, 45.457] },
      'shuttle'
    );

    expect(result).toBeNull();
  });

  it('calculates the correct distance between two locations', () => {
    const position1 = [-73.9857, 40.7488]; // NYC
    const position2 = [-0.1276, 51.5074]; // London
    const distance = getDistanceFromPositions(position1, position2);
    expect(distance).toBeGreaterThan(5500000);
    expect(distance).toBeLessThan(6000000); // NYC-London ~5570 km
  });
});

describe('getIndoorRoute', () => {
  test('should return null when neither feature has a level', async () => {
    const startFeature: Feature<Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-73.578, 45.497],
            [-73.5784711, 45.4970661],
          ],
        ],
      },
    };
    const endFeature: Feature<Polygon> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-73.6393324, 45.4577857],
            [-73.639, 45.457],
          ],
        ],
      },
    };
    const result = getIndoorRoute(indoorMaps[0], startFeature, endFeature);
    expect(result).toBeNull();
  });

  test("should return no paths when the features aren't connected to the pathway", async () => {
    const startFeature: Feature<Polygon> = {
      type: 'Feature',
      properties: {
        level: '8',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-73.578, 45.497],
            [-73.5784711, 45.4970661],
          ],
        ],
      },
    };
    const endFeature: Feature<Polygon> = {
      type: 'Feature',
      properties: {
        level: '8',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-73.6393324, 45.4577857],
            [-73.639, 45.457],
          ],
        ],
      },
    };
    const result = getIndoorRoute(indoorMaps[0], startFeature, endFeature);
    expect(result).toBeNull();
  });
});
