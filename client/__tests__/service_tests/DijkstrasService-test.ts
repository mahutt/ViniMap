import { findShortestPath } from '@/services/DijkstrasService';
import { Feature, LineString, Position } from 'geojson';
import turfDistance from '@turf/distance';
import { point } from '@turf/helpers';

// Mock the turf modules
jest.mock('@turf/distance', () => jest.fn());
jest.mock('@turf/helpers', () => ({
  point: jest.fn(),
}));
describe('findShortestPath', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementation
    (turfDistance as jest.Mock).mockImplementation((from, to) => {
      // Simple mock that returns fixed distance (can be improved for specific tests)
      return 1;
    });
    (point as jest.Mock).mockImplementation((coord) => {
      return { geometry: { coordinates: coord } };
    });
  });

  test('should return null if no path exists between points', () => {
    // Setup two disconnected segments
    const footways: Feature<LineString>[] = [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 1],
          ],
        },
        properties: {},
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [10, 10],
            [11, 11],
          ],
        },
        properties: {},
      },
    ];

    const result = findShortestPath([0, 0], [10, 10], footways);
    expect(result).toBeNull();
  });
});
