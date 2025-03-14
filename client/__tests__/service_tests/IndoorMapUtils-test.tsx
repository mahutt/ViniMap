import {
  overlap,
  filterWithLevel,
  bboxCenter,
  getIndoorFeatureFromCoordinates,
} from '@/modules/map/IndoorMapUtils';
import { IndoorMap } from '@/modules/map/IndoorMap';
import GeojsonService from '@/services/GeojsonService';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

// Mock dependencies
jest.mock('@turf/boolean-point-in-polygon');
jest.mock('@/services/GeojsonService');

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

    // Setup default mock implementations
    (GeojsonService.extractLevelFromFeature as jest.Mock).mockImplementation((feature) => {
      return feature.properties?.level !== undefined ? feature.properties.level : null;
    });

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

    (GeojsonService.extractLevelFromFeature as jest.Mock).mockReturnValue({ min: 1, max: 3 });

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
        properties: { level: 1, ref: 'Room 101' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    ];

    (booleanPointInPolygon as jest.Mock).mockReturnValue(true);

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 1);

    expect(result).toEqual({
      coordinates: [50, 50],
      name: 'Room 101',
      data: { address: 'building1', isOpen: false },
    });
  });

  test('returns location with default name when ref is missing', () => {
    const indoorMap = createMockIndoorMap();
    indoorMap.geojson.features = [
      {
        type: 'Feature',
        properties: { level: 1 },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    ];

    (booleanPointInPolygon as jest.Mock).mockReturnValue(true);

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 1);

    expect(result).toEqual({
      coordinates: [50, 50],
      name: 'Unknown room',
      data: { address: 'building1', isOpen: false },
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

    (GeojsonService.extractLevelFromFeature as jest.Mock).mockReturnValue({ min: 1, max: 3 });
    (booleanPointInPolygon as jest.Mock).mockReturnValue(true);

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 2);

    expect(result).toEqual({
      coordinates: [50, 50],
      name: 'Stairwell',
      data: { address: 'building1', isOpen: false },
    });
  });

  test('returns first matching feature when multiple features contain the point', () => {
    const indoorMap = createMockIndoorMap();
    indoorMap.geojson.features = [
      {
        type: 'Feature',
        properties: { level: 1, ref: 'Room 101' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
      {
        type: 'Feature',
        properties: { level: 1, ref: 'Room 102' },
        geometry: { type: 'Polygon', coordinates: [[]] },
      },
    ];

    (booleanPointInPolygon as jest.Mock).mockReturnValue(true);

    const result = getIndoorFeatureFromCoordinates(indoorMap, [50, 50], 1);

    expect(result).toEqual({
      coordinates: [50, 50],
      name: 'Room 101',
      data: { address: 'building1', isOpen: false },
    });
  });
});
