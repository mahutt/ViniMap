import type { FeatureCollection, Geometry } from 'geojson';

/**
    Internal representation of a pair of coordinates.
    Coordinates: [longitude, latitude]
*/
export type Coordinates = [number, number];

export interface Segment {
  id: string;
  type: 'solid' | 'dashed';
  steps: Coordinates[];
}

export interface Route {
  duration: number;
  distance: number;
  segments: Segment[];
}

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type LayerSpecification = any;

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type ExpressionSpecification = any; // Meant to reference a type from MapLibre spec (see map-gl-indoor)
// NOSONAR
export type Level = number;
export type IndoorMapGeoJSON = FeatureCollection<Geometry>;
export type LevelsRange = {
  min: Level;
  max: Level;
};

/**
 * Internal representation of a location.
 */
export interface Location {
  name: string | null;
  coordinates: Coordinates;
  data?: any;
}
