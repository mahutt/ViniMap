import {
  overlap,
  filterWithLevel,
  bboxCenter,
  getIndoorFeatureFromCoordinates,
  footwaysForLevel,
  getStartEndLevels,
  getClosestLevels,
  getConnectionsBetween,
} from '@/modules/map/IndoorMapUtils';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { IndoorMap } from '../../modules/map/Types';
import type { Feature, LineString, Polygon } from 'geojson';

// Mock dependencies
jest.mock('@turf/boolean-point-in-polygon');

describe('overlap', () => {
  test('returns false when one rectangle is to the left of the other', () => {
    const testBounds1 = [0, 0, 5, 5] as [number, number, number, number];
    const testBounds2 = [6, 0, 10, 5] as [number, number, number, number];
    expect(overlap(testBounds1, testBounds2)).toBe(false);
    expect(overlap(testBounds2, testBounds1)).toBe(false);
  });

  test('returns false when one rectangle is above the other', () => {
    const testBounds1 = [0, 0, 5, 5] as [number, number, number, number];
    const testBounds2 = [0, 6, 5, 10] as [number, number, number, number];
    expect(overlap(testBounds1, testBounds2)).toBe(false);
    expect(overlap(testBounds2, testBounds1)).toBe(false);
  });

  test('returns true when rectangles overlap', () => {
    const bounds1 = [0, 0, 5, 5] as [number, number, number, number];
    const bounds2 = [3, 3, 8, 8] as [number, number, number, number];
    expect(overlap(bounds1, bounds2)).toBe(true);
  });

  test('returns true when one rectangle is inside the other', () => {
    const bounds1 = [0, 0, 10, 10] as [number, number, number, number];
    const bounds2 = [2, 2, 8, 8] as [number, number, number, number];
    expect(overlap(bounds1, bounds2)).toBe(true);
  });

  test('returns true when rectangles share an edge', () => {
    const bounds1 = [0, 0, 5, 5] as [number, number, number, number];
    const bounds2 = [5, 0, 10, 5] as [number, number, number, number];
    expect(overlap(bounds1, bounds2)).toBe(true);
  });
});

describe('filterWithLevel', () => {
  test('creates filter with level equality for simple level', () => {
    const initialFilter = ['==', 'type', 'room'];
    const level = 2;

    const result = filterWithLevel(initialFilter, level);

    expect(result).toEqual([
      'all',
      ['==', 'type', 'room'],
      [
        'any',
        false,
        [
          'all',
          ['has', 'level'],
          [
            'any',
            ['==', ['get', 'level'], '2'],
            [
              'all',
              ['!=', ['index-of', ';', ['get', 'level']], -1],
              [
                '>=',
                2,
                ['to-number', ['slice', ['get', 'level'], 0, ['index-of', ';', ['get', 'level']]]],
              ],
              [
                '<=',
                2,
                [
                  'to-number',
                  ['slice', ['get', 'level'], ['+', ['index-of', ';', ['get', 'level']], 1]],
                ],
              ],
            ],
          ],
        ],
      ],
    ]);
  });

  test('includes option for empty level when showFeaturesWithEmptyLevel is true', () => {
    const initialFilter = ['==', 'type', 'room'];
    const level = 2;
    const showFeaturesWithEmptyLevel = true;

    const result = filterWithLevel(initialFilter, level, showFeaturesWithEmptyLevel);

    expect(result[2][1]).toEqual(['!', ['has', 'level']]);
  });
});

describe('bboxCenter', () => {
  test('calculates center of bounding box correctly', () => {
    const bbox = [0, 10, 20, 50] as [number, number, number, number];
    const center = bboxCenter(bbox);
    expect(center).toEqual([10, 30]);
  });

  test('handles negative coordinates correctly', () => {
    const bbox = [-20, -50, -10, -20] as [number, number, number, number];
    const center = bboxCenter(bbox);
    expect(center).toEqual([-15, -35]);
  });

  test('handles mixed positive and negative coordinates', () => {
    const bbox = [-20, -10, 20, 10] as [number, number, number, number];
    const center = bboxCenter(bbox);
    expect(center).toEqual([0, 0]);
  });
});

describe('getIndoorFeatureFromCoordinates', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (booleanPointInPolygon as jest.Mock).mockImplementation(() => false);
  });

  const createMockIndoorMap = (): IndoorMap => ({
    id: 'building1',
    bounds: [0, 0, 100, 100] as [number, number, number, number],
    levelsRange: { min: 0, max: 5 },
    geojson: {
      type: 'FeatureCollection',
      features: [],
    },
  });

  test('returns null when coordinates are outside map bounds', () => {
    const indoorMap = createMockIndoorMap();
    const result = getIndoorFeatureFromCoordinates(indoorMap, [-10, 50], 1);
    expect(result).toBeNull();
  });

  test('returns null when level is outside map level range', () => {
    const indoorMap = createMockIndoorMap();
    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 10);
    expect(result).toBeNull();
  });

  test('returns null when no matching feature is found', () => {
    const indoorMap = createMockIndoorMap();
    indoorMap.geojson.features = [
      {
        type: 'Feature',
        properties: { level: 2, ref: 'Room 201' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    ];

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 1);
    expect(result).toBeNull();
  });

  test('returns null when feature level does not match requested level', () => {
    const indoorMap = createMockIndoorMap();
    indoorMap.geojson.features = [
      {
        type: 'Feature',
        properties: { level: 2, ref: 'Room 201' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    ];

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 1);
    expect(result).toBeNull();
  });

  test('returns null when feature has range level and requested level is outside range', () => {
    const indoorMap = createMockIndoorMap();
    indoorMap.geojson.features = [
      {
        type: 'Feature',
        properties: { level: '1;3', ref: 'Stairwell' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    ];

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 4);
    expect(result).toBeNull();
  });

  test('returns null when feature geometry is not a polygon', () => {
    const indoorMap = createMockIndoorMap();
    indoorMap.geojson.features = [
      {
        type: 'Feature',
        properties: { level: 1, ref: 'Point of Interest' },
        geometry: { type: 'Point', coordinates: [50, 50] },
      },
    ];

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 1);
    expect(result).toBeNull();
  });

  test('returns location when coordinates are inside a polygon and levels match', () => {
    const indoorMap = createMockIndoorMap();
    indoorMap.geojson.features = [
      {
        type: 'Feature',
        properties: { level: '1', ref: 'Room 101' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    ];

    (booleanPointInPolygon as jest.Mock).mockReturnValue(true);

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 1);

    expect(result).toEqual({
      coordinates: [50, 50],
      name: 'Room 101',
      data: {
        address: 'building1',
        isOpen: false,
        feature: indoorMap.geojson.features[0],
        indoorMap: indoorMap,
        level: 1,
        ref: 'Room 101',
      },
    });
  });

  test('returns location with default name when ref is missing', () => {
    const indoorMap = createMockIndoorMap();
    indoorMap.geojson.features = [
      {
        type: 'Feature',
        properties: { level: '1' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    ];

    (booleanPointInPolygon as jest.Mock).mockReturnValue(true);

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 1);

    expect(result).toEqual({
      coordinates: [50, 50],
      name: 'Unknown room',
      data: {
        address: 'building1',
        isOpen: false,
        indoorMap,
        level: 1,
        feature: indoorMap.geojson.features[0],
      },
    });
  });

  test('handles level range features correctly when level is within range', () => {
    const indoorMap = createMockIndoorMap();
    indoorMap.geojson.features = [
      {
        type: 'Feature',
        properties: { level: '1;3', ref: 'Stairwell' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    ];

    (booleanPointInPolygon as jest.Mock).mockReturnValue(true);

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 2);

    expect(result).toEqual({
      coordinates: [50, 50],
      name: 'Stairwell',
      data: {
        address: 'building1',
        isOpen: false,
        indoorMap,
        level: {
          max: 3,
          min: 1,
        },
        ref: 'Stairwell',
        feature: indoorMap.geojson.features[0],
      },
    });
  });

  test('returns first matching feature when multiple features contain the point', () => {
    const indoorMap = createMockIndoorMap();
    indoorMap.geojson.features = [
      {
        type: 'Feature',
        properties: { level: '1', ref: 'Room 101' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
      {
        type: 'Feature',
        properties: { level: '1', ref: 'Room 102' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    ];

    (booleanPointInPolygon as jest.Mock).mockReturnValue(true);

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 1);

    expect(result).toEqual({
      coordinates: [50, 50],
      name: 'Room 101',
      data: {
        address: 'building1',
        isOpen: false,
        indoorMap,
        level: 1,
        ref: 'Room 101',
        feature: indoorMap.geojson.features[0],
      },
    });
  });
});

describe('footwaysForLevel', () => {
  let mockIndoorMap: IndoorMap;

  beforeEach(() => {
    mockIndoorMap = {
      id: 'test-building',
      bounds: [0, 0, 100, 100],
      levelsRange: { min: 0, max: 3 },
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              level: '1',
              highway: 'footway',
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [10, 10],
                [20, 20],
              ],
            },
          },

          {
            type: 'Feature',
            properties: {
              level: '2',
              highway: 'footway',
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [30, 30],
                [40, 40],
              ],
            },
          },

          {
            type: 'Feature',
            properties: {
              level: '1',
              highway: 'footway',
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [50, 50],
                [60, 60],
              ],
            },
          },

          {
            type: 'Feature',
            properties: {
              level: '1',
              highway: 'corridor',
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [70, 70],
                [80, 80],
              ],
            },
          },

          {
            type: 'Feature',
            properties: {
              level: '1',
              highway: 'footway',
            },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [10, 10],
                  [10, 20],
                  [20, 20],
                  [20, 10],
                  [10, 10],
                ],
              ],
            },
          },

          {
            type: 'Feature',
            properties: {
              level: '3',
              highway: 'footway',
            },
            geometry: {
              type: 'LineString',
              coordinates: [
                [90, 90],
                [100, 100],
              ],
            },
          },
        ],
      },
    };
  });

  test('should return only footways for the specified level', () => {
    const result = footwaysForLevel(mockIndoorMap, 1);

    expect(result).toHaveLength(2);

    result.forEach((feature) => {
      expect(feature.properties?.highway).toBe('footway');
      expect(feature.properties?.level).toBe('1');
      expect(feature.geometry.type).toBe('LineString');
    });

    expect(result[0].geometry.coordinates).toEqual([
      [10, 10],
      [20, 20],
    ]);
    expect(result[1].geometry.coordinates).toEqual([
      [50, 50],
      [60, 60],
    ]);
  });

  test('should return only footways for level 2', () => {
    const result = footwaysForLevel(mockIndoorMap, 2);

    expect(result).toHaveLength(1);
    expect(result[0].properties?.level).toBe('2');
    expect(result[0].geometry.coordinates).toEqual([
      [30, 30],
      [40, 40],
    ]);
  });

  test('should return empty array if no footways exist for the level', () => {
    const result = footwaysForLevel(mockIndoorMap, 0);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  test('should filter out non-footway LineString features', () => {
    const result = footwaysForLevel(mockIndoorMap, 1);

    const includeCorridor = result.some((feature) => feature.properties?.highway === 'corridor');
    expect(includeCorridor).toBe(false);
  });

  test('should handle string level values correctly', () => {
    mockIndoorMap.geojson.features.push({
      type: 'Feature',
      properties: {
        level: '1.0',
        highway: 'footway',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [15, 15],
          [25, 25],
        ],
      },
    });

    const result = footwaysForLevel(mockIndoorMap, 1);

    expect(result).toHaveLength(3);
  });
});

describe('getClosestLevels', () => {
  test('returns the mins of both ranges when ranges match', () => {
    const startRange = { min: 8, max: 10 };
    const endRange = { min: 8, max: 10 };
    expect(getClosestLevels(startRange, endRange)).toEqual([8, 8]);
  });
  test('returns the mins of both ranges when mins of ranges match', () => {
    const startRange = { min: 8, max: 100 };
    const endRange = { min: 8, max: 20 };
    expect(getClosestLevels(startRange, endRange)).toEqual([8, 8]);
  });
  test('returns the lowest common level (twice) of both ranges when ranges overlap', () => {
    const startRange = { min: 6, max: 50 };
    const endRange = { min: 8, max: 60 };
    expect(getClosestLevels(startRange, endRange)).toEqual([8, 8]);
  });
  test('returns the min and max of the start and end ranges, respectively, when the start range is above the end range', () => {
    const startRange = { min: 20, max: 30 };
    const endRange = { min: 0, max: 10 };
    expect(getClosestLevels(startRange, endRange)).toEqual([20, 10]);
  });
  test('returns the max and min of the start and end ranges, respectively, when the start range is below the end range', () => {
    const startRange = { min: 0, max: 10 };
    const endRange = { min: 20, max: 30 };
    expect(getClosestLevels(startRange, endRange)).toEqual([10, 20]);
  });
});

describe('getStartEndLevels', () => {
  test("returns null when passed features don't have level properties", () => {
    const startFeature: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };
    const endFeature: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };
    expect(getStartEndLevels(startFeature, endFeature)).toEqual(null);
  });

  test('returns the closest level of a start multi-level start feature to a single-level end feature', () => {
    const startFeature: Feature = {
      type: 'Feature',
      properties: {
        level: '1;3',
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };
    const endFeature: Feature = {
      type: 'Feature',
      properties: {
        level: '2',
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };
    expect(getStartEndLevels(startFeature, endFeature)).toEqual([2, 2]);
  });

  test('returns the closest level of a start multi-level end feature to a single-level start feature', () => {
    const startFeature: Feature = {
      type: 'Feature',
      properties: {
        level: '2',
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };
    const endFeature: Feature = {
      type: 'Feature',
      properties: {
        level: '4;5',
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };
    expect(getStartEndLevels(startFeature, endFeature)).toEqual([2, 4]);
  });

  test('returns the closest level of a start multi-level end feature to a single-level start feature', () => {
    const startFeature: Feature = {
      type: 'Feature',
      properties: {
        level: '2',
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };
    const endFeature: Feature = {
      type: 'Feature',
      properties: {
        level: '2',
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
    };
    expect(getStartEndLevels(startFeature, endFeature)).toEqual([2, 2]);
  });
});

describe('getConnectionsBetween', () => {
  // Mock data
  const createMockFeature = (props: any): Feature<Polygon | LineString> => ({
    type: 'Feature',
    properties: props,
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0]]],
    },
  });

  const mockLevel1 = 1;
  const mockLevel2 = 2;
  const mockLevel3 = 3;

  const mockStairFeature = createMockFeature({ stairs: 'yes', level: '1;3' });
  const mockElevatorFeature = createMockFeature({ highway: 'elevator', level: '1;2' });
  const mockInvalidTypeFeature = createMockFeature({ stairs: 'yes', level: '1;3' });
  const mockOutOfRangeFeature = createMockFeature({ stairs: 'yes', level: '2;3' });
  const mockNullLevelFeature = createMockFeature({ stairs: 'yes', level: null });
  const mockNumberLevelFeature = createMockFeature({ stairs: 'yes', level: '1' });

  const mockIndoorMap: IndoorMap = {
    id: 'test-map',
    bounds: [0, 0, 1, 1] as [number, number, number, number],
    geojson: {
      type: 'FeatureCollection',
      features: [
        mockStairFeature,
        mockElevatorFeature,
        mockInvalidTypeFeature,
        mockOutOfRangeFeature,
        mockNullLevelFeature,
        mockNumberLevelFeature,
      ],
    },
    levelsRange: { min: 1, max: 3 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return stairs or elevator features that connect the specified levels', () => {
    const result = getConnectionsBetween(mockLevel1, mockLevel2, mockIndoorMap);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mockStairFeature);
  });

  it('should filter out features that do not have Polygon geometry', () => {
    const result = getConnectionsBetween(mockLevel1, mockLevel2, mockIndoorMap);

    expect(result).not.toContain(mockInvalidTypeFeature);
  });

  it('should filter out features with level range not covering both start and end levels', () => {
    const result = getConnectionsBetween(mockLevel1, mockLevel3, mockIndoorMap);

    expect(result).not.toContain(mockElevatorFeature);
    expect(result).toContain(mockStairFeature);
  });

  it('should filter out features with null level', () => {
    const result = getConnectionsBetween(mockLevel1, mockLevel2, mockIndoorMap);

    expect(result).not.toContain(mockNullLevelFeature);
  });

  it('should filter out features with non-object level', () => {
    const result = getConnectionsBetween(mockLevel1, mockLevel2, mockIndoorMap);

    expect(result).not.toContain(mockNumberLevelFeature);
  });

  it('should return an empty array when no valid connections exist', () => {
    // Mock an indoor map with no valid connections
    const emptyMap: IndoorMap = {
      ...mockIndoorMap,
      geojson: { type: 'FeatureCollection', features: [] },
    };

    const result = getConnectionsBetween(mockLevel1, mockLevel2, emptyMap);

    expect(result).toEqual([]);
  });

  it('should only return the first valid connection found', () => {
    // Create an indoor map with multiple valid connections
    const multipleConnectionsMap: IndoorMap = {
      ...mockIndoorMap,
      geojson: {
        type: 'FeatureCollection',
        features: [
          mockStairFeature,
          createMockFeature({ stairs: 'yes', level: '1;3' }),
          createMockFeature({ highway: 'elevator', level: '1;3' }),
        ],
      },
    };

    const result = getConnectionsBetween(mockLevel1, mockLevel2, multipleConnectionsMap);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mockStairFeature);
  });
});
