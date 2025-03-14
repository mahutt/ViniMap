import { Coordinates, ExpressionSpecification, Level, Location, IndoorMap } from './Types';
import type { BBox, Feature } from 'geojson';
import GeojsonService from '@/services/GeojsonService';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

export function overlap(bounds1: BBox, bounds2: BBox) {
  // If one rectangle is on left side of other
  if (bounds1[0] > bounds2[2] || bounds2[0] > bounds1[2]) {
    return false;
  }

  // If one rectangle is above other
  if (bounds1[3] < bounds2[1] || bounds2[3] < bounds1[1]) {
    return false;
  }

  return true;
}

export function filterWithLevel(
  initialFilter: ExpressionSpecification,
  level: Level,
  showFeaturesWithEmptyLevel: boolean = false
): ExpressionSpecification {
  return [
    'all',
    initialFilter,
    [
      'any',
      showFeaturesWithEmptyLevel ? ['!', ['has', 'level']] : false,
      [
        'all',
        ['has', 'level'],
        [
          'any',
          ['==', ['get', 'level'], level.toString()],
          [
            'all',
            ['!=', ['index-of', ';', ['get', 'level']], -1],
            [
              '>=',
              level,
              ['to-number', ['slice', ['get', 'level'], 0, ['index-of', ';', ['get', 'level']]]],
            ],
            [
              '<=',
              level,
              [
                'to-number',
                ['slice', ['get', 'level'], ['+', ['index-of', ';', ['get', 'level']], 1]],
              ],
            ],
          ],
        ],
      ],
    ],
  ];
}

export function bboxCenter(bbox: BBox): Coordinates {
  const [west, south, east, north] = bbox;
  return [(west + east) / 2, (south + north) / 2];
}

export function getIndoorFeatureFromProperties(
  indoorMap: IndoorMap,
  key: string,
  value: string
): Location | null {
  for (let feature of indoorMap.geojson.features) {
    if (feature.properties) {
      if (feature.properties && feature.properties[key] && feature.properties[key] == value) {
        let coordinates = feature.properties.geometry?.coordinates ?? null;
        if (!coordinates) {
          return null;
        }
        let featureLevel = GeojsonService.extractLevelFromFeature(feature);

        return {
          coordinates,
          name: null,
          data: {
            address: indoorMap.id,
            isOpen: false,
            level: featureLevel,
            indoorMapId: indoorMap.id,
          },
        };
      }
    } else {
      return null;
    }
  }
  return null;
}
export function footwaysForLevel(indoorMap: IndoorMap, level: Level): Feature[] {
  const footwayFeatures = indoorMap.geojson.features.filter(
    (feature) =>
      feature.geometry.type === 'LineString' &&
      feature.properties?.highway === 'footway' &&
      (Number(feature.properties?.level) as Level) == level // Might need to use parsefloat in case of bugs
  );
  return footwayFeatures;
}

export function getIndoorFeatureFromCoordinates(
  indoorMap: IndoorMap,
  coordinates: Coordinates,
  level: Level
): Location | null {
  if (
    coordinates[0] < indoorMap.bounds[0] ||
    coordinates[0] > indoorMap.bounds[2] ||
    coordinates[1] < indoorMap.bounds[1] ||
    coordinates[1] > indoorMap.bounds[3] ||
    level < indoorMap.levelsRange.min ||
    level > indoorMap.levelsRange.max
  ) {
    return null;
  }

  for (let feature of indoorMap.geojson.features) {
    const featureLevel = GeojsonService.extractLevelFromFeature(feature);
    if (
      featureLevel === null ||
      (typeof featureLevel === 'number' && featureLevel !== level) ||
      (typeof featureLevel === 'object' &&
        (level < featureLevel.min || level > featureLevel.max)) ||
      feature.geometry.type !== 'Polygon' // Currently, we only intercept taps on polygon features
    ) {
      continue;
    }
    if (booleanPointInPolygon(coordinates, feature.geometry)) {
      const name =
        feature?.properties?.name ||
        getFallbackNameByAmenity(feature?.properties?.amenity) ||
        feature?.properties?.ref ||
        'Unknown room';
      return {
        coordinates,
        name,
        data: {
          address: indoorMap.id,
          isOpen: false,
          level: featureLevel,
          indoorMapId: indoorMap.id,
        },
      };
    }
  }

  return null;
}

const FALLBACK_NAME_BY_AMENITY = {
  toilets: 'Toilets',
  vending_machine: 'Vending machine',
  fast_food: 'Fast food',
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  fountain: 'Fountain',
  eating_area: 'Eating area',
  information: 'Information',
};

const getFallbackNameByAmenity = (amenity: string | null) => {
  if (amenity && amenity in FALLBACK_NAME_BY_AMENITY) {
    return FALLBACK_NAME_BY_AMENITY[amenity as keyof typeof FALLBACK_NAME_BY_AMENITY];
  }
  return null;
};
