// This file has been copied directly from https://github.com/map-gl-indoor/map-gl-indoor,
// a library that has been adapted for this project. The helpers in this file are one
// of the few functions that did not need to be modified.

import bbox from '@turf/bbox';

import type { BBox, Feature, LineString, Point, Polygon, Position } from 'geojson';
import type { LevelsRange, IndoorMapGeoJSON, Level } from '@/modules/map/Types';
import * as turf from '@turf/turf';

/**
 * Helper for Geojson data
 */
class GeojsonService {
  /**
   * Extract level from feature
   *
   * @param {GeoJSONFeature} feature geojson feature
   * @returns {LevelsRange | number | null} the level or the range of level.
   */
  static extractLevelFromFeature(feature: Feature): Level | LevelsRange | null {
    if (!!feature.properties && feature.properties.level !== null) {
      const propertyLevel = feature.properties['level'];
      if (typeof propertyLevel === 'string') {
        return this.parsePropertyLevel(propertyLevel);
      }
    }
    return null;
  }

  static parsePropertyLevel(propertyLevel: string): Level | LevelsRange | null {
    const splitLevel = propertyLevel.split(';');
    if (splitLevel.length === 1) {
      const level = parseFloat(propertyLevel);
      if (!isNaN(level)) {
        return level;
      }
    } else if (splitLevel.length === 2) {
      const level1 = parseFloat(splitLevel[0]);
      const level2 = parseFloat(splitLevel[1]);
      if (!isNaN(level1) && !isNaN(level2)) {
        return {
          min: Math.min(level1, level2),
          max: Math.max(level1, level2),
        };
      }
    }
    return null;
  }

  /**
   * Extract levels range and bounds from geojson
   *
   * @param {IndoorMapGeoJSON} geojson the geojson
   * @returns {Object} the levels range and bounds.
   */
  static extractLevelsRangeAndBounds(geojson: IndoorMapGeoJSON): {
    levelsRange: LevelsRange;
    bounds: BBox;
  } {
    let minLevel = Infinity;
    let maxLevel = -Infinity;

    const bounds = bbox(geojson);

    const parseFeature = (feature: Feature): void => {
      const level = this.extractLevelFromFeature(feature);
      if (level === null) {
        return;
      }
      if (typeof level === 'number') {
        minLevel = Math.min(minLevel, level);
        maxLevel = Math.max(maxLevel, level);
      } else if (typeof level === 'object') {
        minLevel = Math.min(minLevel, level.min);
        maxLevel = Math.max(maxLevel, level.max);
      }
    };

    if (geojson.type === 'FeatureCollection') {
      geojson.features.forEach(parseFeature);
    }

    if (minLevel === Infinity || maxLevel === -Infinity) {
      throw new Error('No level found');
    }
    return {
      levelsRange: { min: minLevel, max: maxLevel },
      bounds,
    };
  }

  static findLinesIntersect(
    lines: Feature<LineString>[],
    pointOrPolygon: Feature<Point | Polygon>
  ): Position[] {
    if (pointOrPolygon.geometry.type === 'Point') {
      const point = pointOrPolygon as Feature<Point>;
      const intersectionPoints: Position[] = [];
      lines.forEach((line) => {
        const isOnLine = turf.booleanPointOnLine(point, line.geometry, { epsilon: 1e-9 });
        if (isOnLine) {
          intersectionPoints.push(turf.getCoord(point));
        }
      });
      return intersectionPoints;
    } else {
      return this.findLinesPolygonIntersect(lines, pointOrPolygon as Feature<Polygon>);
    }
  }

  static findLinesPolygonIntersect(
    lines: Feature<LineString>[],
    polygon: Feature<Polygon>
  ): Position[] {
    const polygonBoundary = turf.lineString(turf.getCoords(polygon)[0]);
    const intersectionPoints: Position[] = [];
    lines.forEach((line) => {
      const intersections = turf.lineIntersect(line.geometry, polygonBoundary);
      const intersectionPoint = intersections.features.map(
        (feature) => feature.geometry.coordinates
      );
      intersectionPoints.push(...intersectionPoint);
    });
    return intersectionPoints;
  }

  static extractEntrances(geojson: IndoorMapGeoJSON): Feature<Point>[] {
    const entrances: Feature<Point>[] = [];
    if (geojson.type === 'FeatureCollection') {
      geojson.features.forEach((feature) => {
        if (feature.properties?.entrance && feature.geometry.type === 'Point') {
          entrances.push(feature as Feature<Point>);
        }
      });
    }
    return entrances;
  }
}
export default GeojsonService;
