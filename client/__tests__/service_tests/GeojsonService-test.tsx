import { IndoorMapGeoJSON } from '@/modules/map/Types';
import GeojsonService from '@/services/GeojsonService';
import type { Feature, FeatureCollection } from 'geojson';

describe('GeojsonService', () => {
  describe('extractLevelFromFeature', () => {
    test('returns single numeric level from string property', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { level: '3' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      expect(GeojsonService.extractLevelFromFeature(feature)).toBe(3);
    });

    test('returns level range from semicolon-separated string', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { level: '2;4' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      expect(GeojsonService.extractLevelFromFeature(feature)).toEqual({
        min: 2,
        max: 4,
      });
    });

    test('returns level range with reversed order', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { level: '4;2' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      expect(GeojsonService.extractLevelFromFeature(feature)).toEqual({
        min: 2,
        max: 4,
      });
    });

    test('returns null when no valid level property', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      expect(GeojsonService.extractLevelFromFeature(feature)).toBeNull();
    });

    test('returns null for invalid level string', () => {
      const feature: Feature = {
        type: 'Feature',
        properties: { level: 'invalid' },
        geometry: { type: 'Point', coordinates: [0, 0] },
      };
      expect(GeojsonService.extractLevelFromFeature(feature)).toBeNull();
    });
  });

  describe('extractLevelsRangeAndBounds', () => {
    test('extracts levels range and bounds from feature collection', () => {
      const geojson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { level: '1' },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
          {
            type: 'Feature',
            properties: { level: '3' },
            geometry: { type: 'Point', coordinates: [1, 1] },
          },
          {
            type: 'Feature',
            properties: { level: '2;4' },
            geometry: { type: 'Point', coordinates: [2, 2] },
          },
        ],
      };

      const result = GeojsonService.extractLevelsRangeAndBounds(geojson as IndoorMapGeoJSON);
      expect(result.levelsRange).toEqual({ min: 1, max: 4 });
      expect(result.bounds).toEqual([0, 0, 2, 2]);
    });

    test('throws error when no levels found', () => {
      const geojson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      };

      expect(() => {
        GeojsonService.extractLevelsRangeAndBounds(geojson as IndoorMapGeoJSON);
      }).toThrow('No level found');
    });
  });

  describe('findLinesIntersect', () => {
    test('returns valid intersections for a point feature', () => {
      const intersections = GeojsonService.findLinesIntersect(
        [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
          },
        ],
        {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: [0.5, 0.5] },
        }
      );
      expect(intersections).toEqual([[0.5, 0.5]]);
    });
    test('returns valid intersections for a polygon feature', () => {
      const intersections = GeojsonService.findLinesIntersect(
        [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
          },
        ],
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [0.25, 0.25],
                [0.75, 0.25],
                [0.75, 0.75],
                [0.25, 0.75],
                [0.25, 0.25],
              ],
            ],
          },
        }
      );
      expect(intersections).toEqual([
        [0.25, 0.25],
        [0.75, 0.75],
      ]);
    });
  });

  describe('extractEntrances', () => {
    test('extracts entrances from an indoor map geojson', () => {
      const entrances = GeojsonService.extractEntrances({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { entrance: true },
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: [1, 1] },
          },
        ],
      });
      expect(entrances).toHaveLength(1);
      expect(entrances[0].geometry.coordinates).toEqual([0, 0]);
    });
  });
});
