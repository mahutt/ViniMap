import type { BBox, FeatureCollection, LineString, Point, Polygon, Position } from 'geojson';
import {
  FillLayerStyleProps,
  LineLayerStyleProps,
  SymbolLayerStyleProps,
} from '@rnmapbox/maps/src/utils/MapboxStyles';

/**
    Internal representation of a pair of coordinates.
    Coordinates: [longitude, latitude]
*/
export type Coordinates = Position;
export type { Position };

export interface Segment {
  id: string;
  type: 'solid' | 'dashed';
  steps: Coordinates[];
  level?: Level;
  taskId?: string;
}

/**
 * Internal representation of a route.
 * duration: Duration in seconds.
 * distance: Distance in meters.
 * segments: List of segments that compose the route.
 */
export interface Route {
  duration: number;
  distance: number;
  segments: Segment[];
  tunnel?: boolean;
}

export interface LayerSpecification {
  id: string;
  type: 'symbol' | 'fill' | 'line';
  source: string;
  filter: any;
  style: SymbolLayerStyleProps | FillLayerStyleProps | LineLayerStyleProps;
}

export type ExpressionSpecification = any; // Meant to reference a type from MapLibre spec (see map-gl-indoor)
export type Level = number;
export type IndoorMapGeoJSON = FeatureCollection<Point | LineString | Polygon>;
export type LevelsRange = {
  min: Level;
  max: Level;
};

export interface IndoorMap {
  id: string;
  mapboxIds: number[];
  bounds: BBox;
  geojson: IndoorMapGeoJSON;
  levelsRange: LevelsRange;
  addr: string;
  opening_hours: string;
  faculty: string;
}

/**
 * Internal representation of a location.
 */
export interface Location {
  name: string | null;
  coordinates: Coordinates;
  data?: any;
}

/**
 * Next Class on Calendar
 */
export interface ClassItem {
  className: string;
  location: string;
  time: string;
}

export type ScheduleData = Record<string, ClassItem[]>;
