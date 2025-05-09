import DijkstraService from '@/services/DijkstrasService';
import type { Feature, LineString } from 'geojson';
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

    (turfDistance as jest.Mock).mockImplementation((from, to) => {
      return 1;
    });
    (point as jest.Mock).mockImplementation((coord) => {
      return { geometry: { coordinates: coord } };
    });
  });

  //Null path
  test('should return null if no path exists between points', () => {
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

    const result = DijkstraService.findShortestPath([0, 0], [10, 10], footways);
    expect(result).toBeNull();
  });

  test('should return null if start point is not part of any footway', () => {
    const footways: Feature<LineString>[] = [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [1, 1],
            [2, 2],
          ],
        },
        properties: {},
      },
    ];
  
    const result = DijkstraService.findShortestPath([0, 0], [2, 2], footways);
    expect(result).toBeNull();
  });

  
  test('should return null if end point is not part of any footway', () => {
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
    ];
  
    const result = DijkstraService.findShortestPath([0, 0], [3, 3], footways);
    expect(result).toBeNull();
  });

  
  test('should return null if path cannot be found due to disconnection', () => {
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
            [5, 5],
            [6, 6],
          ],
        },
        properties: {},
      },
    ];
  
    const result = DijkstraService.findShortestPath([0, 0], [6, 6], footways);
    expect(result).toBeNull();
  });
  

  //Single path available
  test('should find path in simple connected network', () => {
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
            [1, 1],
            [2, 2],
          ],
        },
        properties: {},
      },
    ];

    (turfDistance as jest.Mock).mockImplementation((from, to) => {
      const fromCoord = from.geometry.coordinates;
      const toCoord = to.geometry.coordinates;

      if (
        JSON.stringify(fromCoord) === JSON.stringify([0, 0]) &&
        JSON.stringify(toCoord) === JSON.stringify([1, 1])
      ) {
        return 1;
      }
      if (
        JSON.stringify(fromCoord) === JSON.stringify([1, 1]) &&
        JSON.stringify(toCoord) === JSON.stringify([2, 2])
      ) {
        return 1;
      }
      return 10;
    });

    const result = DijkstraService.findShortestPath([0, 0], [2, 2], footways);
    expect(result).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
    ]);
  });

  test('should find the shortest path when multiple paths exist', () => {
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
            [1, 1],
            [2, 2],
          ],
        },
        properties: {},
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, -1],
          ],
        },
        properties: {},
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [1, -1],
            [2, 2],
          ],
        },
        properties: {},
      },
    ];

    (turfDistance as jest.Mock).mockImplementation((from, to) => {
      const fromCoord = from.geometry.coordinates;
      const toCoord = to.geometry.coordinates;

      if (
        (JSON.stringify(fromCoord) === JSON.stringify([0, 0]) &&
          JSON.stringify(toCoord) === JSON.stringify([1, 1])) ||
        (JSON.stringify(fromCoord) === JSON.stringify([1, 1]) &&
          JSON.stringify(toCoord) === JSON.stringify([0, 0]))
      ) {
        return 1;
      }
      if (
        (JSON.stringify(fromCoord) === JSON.stringify([1, 1]) &&
          JSON.stringify(toCoord) === JSON.stringify([2, 2])) ||
        (JSON.stringify(fromCoord) === JSON.stringify([2, 2]) &&
          JSON.stringify(toCoord) === JSON.stringify([1, 1]))
      ) {
        return 1;
      }

      if (
        (JSON.stringify(fromCoord) === JSON.stringify([0, 0]) &&
          JSON.stringify(toCoord) === JSON.stringify([1, -1])) ||
        (JSON.stringify(fromCoord) === JSON.stringify([1, -1]) &&
          JSON.stringify(toCoord) === JSON.stringify([0, 0]))
      ) {
        return 2;
      }
      if (
        (JSON.stringify(fromCoord) === JSON.stringify([1, -1]) &&
          JSON.stringify(toCoord) === JSON.stringify([2, 2])) ||
        (JSON.stringify(fromCoord) === JSON.stringify([2, 2]) &&
          JSON.stringify(toCoord) === JSON.stringify([1, -1]))
      ) {
        return 3;
      }

      return 10;
    });

    const result = DijkstraService.findShortestPath([0, 0], [2, 2], footways);
    expect(result).toEqual([
      [0, 0],
      [1, 1],
      [2, 2],
    ]);
  });

  //start = end case
  test('should handle the case when start and end are the same', () => {
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
    ];

    const result = DijkstraService.findShortestPath([0, 0], [0, 0], footways);
    expect(result).toEqual([[0, 0]]);
  });

  //edge case
  test('should connect start and end points to the graph correctly', () => {
    const footways: Feature<LineString>[] = [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [1, 1],
            [2, 2],
            [3, 3],
          ],
        },
        properties: {},
      },
    ];

    const result = DijkstraService.findShortestPath([1, 1], [3, 3], footways);
    expect(result).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
  });
  //with larger networks
  test('should handle a complex network', () => {
    const footways: Feature<LineString>[] = [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [1, 0],
            [2, 0],
          ],
        },
        properties: {},
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 1],
            [1, 1],
            [2, 1],
          ],
        },
        properties: {},
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [0, 0],
            [0, 1],
          ],
        },
        properties: {},
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [1, 0],
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
            [2, 0],
            [2, 1],
          ],
        },
        properties: {},
      },
    ];

    (turfDistance as jest.Mock).mockImplementation((from, to) => {
      const fromCoord = from.geometry.coordinates;
      const toCoord = to.geometry.coordinates;

      if (fromCoord[1] === toCoord[1]) {
        return 1;
      }

      return 2;
    });

    const result = DijkstraService.findShortestPath([0, 0], [2, 1], footways);

    expect(result).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ]);
  });
});
