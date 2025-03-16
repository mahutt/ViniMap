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

export interface Segment {
  id: string;
  type: 'solid' | 'dashed';
  steps: Coordinates[];
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
  bounds: BBox;
  geojson: IndoorMapGeoJSON;
  levelsRange: LevelsRange;
}

/**
 * Internal representation of a location.
 */
export interface Location {
  name: string | null;
  coordinates: Coordinates;
  data?: any;
}
