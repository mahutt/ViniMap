import type { BBox, Feature, LineString, Polygon } from 'geojson';
import {
  Coordinates,
  ExpressionSpecification,
  Level,
  Location,
  IndoorMap,
  LevelsRange,
} from './Types';
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

export function footwaysForLevel(indoorMap: IndoorMap, level: Level): Feature<LineString>[] {
  const footwayFeatures = indoorMap.geojson.features.filter(
    (feature) =>
      parseFloat(feature.properties?.level) === level &&
      feature.properties?.highway === 'footway' &&
      feature.geometry.type === 'LineString'
  );
  return footwayFeatures as Feature<LineString>[];
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
          indoorMap: indoorMap,
          ref: feature?.properties?.ref,
          feature,
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

// Given two features,
// returns the closest and smallest levels between the two features.
export const getStartEndLevels = (
  startFeature: Feature,
  endFeature: Feature
): [Level, Level] | null => {
  let startLevelOrRange = GeojsonService.extractLevelFromFeature(startFeature);
  let endLevelOrRange = GeojsonService.extractLevelFromFeature(endFeature);

  // If either the start or the end feature doesn't have a level,
  // we can't find a route between them.
  if (startLevelOrRange === null || endLevelOrRange === null) {
    return null;
  }

  let startLevel: Level;
  let endLevel: Level;

  // If the start feature spans a range of levels
  // and the end feature also spans a range of levels,
  // we provide a route between the two "closest" levels (minimize up/down stairs)
  if (typeof startLevelOrRange === 'object' && typeof endLevelOrRange === 'object') {
    [startLevel, endLevel] = getClosestLevels(startLevelOrRange, endLevelOrRange);
  }
  // If only the start feature spans a range of levels,
  // we provide a route from the start level closest to the end level
  else if (typeof startLevelOrRange === 'object') {
    endLevel = endLevelOrRange as Level;
    startLevel = getClosestLevel(endLevel, startLevelOrRange);
  }
  // If only the end feature spans a range of levels,
  // we provide a route to the end level closest to the start level
  else if (typeof endLevelOrRange === 'object') {
    startLevel = startLevelOrRange;
    endLevel = getClosestLevel(startLevel, endLevelOrRange);
  } else {
    startLevel = startLevelOrRange;
    endLevel = endLevelOrRange;
  }

  return [startLevel, endLevel];
};

// Given two levels ranges,
// returns one level from each range that are the closest to each other.
export const getClosestLevels = (
  levelsRange1: LevelsRange,
  levelsRange2: LevelsRange
): [Level, Level] => {
  let level1: Level;
  let level2: Level;

  if (levelsRange1.min < levelsRange2.max && levelsRange1.max > levelsRange2.min) {
    const smallestCommonLevel = Math.max(levelsRange1.min, levelsRange2.min);
    level1 = smallestCommonLevel;
    level2 = smallestCommonLevel;
  } else {
    level1 = levelsRange1.min > levelsRange2.max ? levelsRange1.min : levelsRange1.max;
    level2 = levelsRange2.max < level1 ? levelsRange2.max : levelsRange2.min;
  }
  return [level1, level2];
};

// Given a level and a levels range,
// returns the closest level from the range to the given level.
export const getClosestLevel = (level: Level, levelsRange: LevelsRange): Level => {
  if (level < levelsRange.min) {
    return levelsRange.min;
  } else if (level > levelsRange.max) {
    return levelsRange.max;
  } else {
    return level;
  }
};

// Returns an array of features that connect two levels of an indoor map.
// Currently, only one connection is returned. We will eventually return multiple connections
// to support more complex indoor maps.
export const getConnectionsBetween = (
  startLevel: Level,
  endLevel: Level,
  indoorMap: IndoorMap
): Feature<Polygon>[] => {
  let possibleConnections = indoorMap.geojson.features.filter(
    (
      feature //feature.properties?.stairs === 'yes' ||
    ) => feature.properties?.highway === 'elevator'
    // || feature.properties?.conveying === 'yes'
  );
  const usableConnections = possibleConnections.filter((feature) => {
    if (feature.geometry.type !== 'Polygon') {
      return false;
    }
    const level = GeojsonService.extractLevelFromFeature(feature);
    if (level !== null && typeof level === 'object') {
      return level.min <= startLevel && level.max >= endLevel;
    }
    return false;
  });
  return usableConnections.slice(0, 1) as Feature<Polygon>[];
};
