import type { FeatureCollection, Geometry } from 'geojson';

/*
Internal representation of a pair of coordinates.
Coordinates: [latitude, longitude]
*/
export type Coordinates = [number, number];

export type LayerSpecification = any;
export type ExpressionSpecification = any; // Meant to reference a type from MapLibre spec (see map-gl-indoor)
export type Level = number;
export type IndoorMapGeoJSON = FeatureCollection<Geometry>;
export type LevelsRange = {
  min: Level;
  max: Level;
};
