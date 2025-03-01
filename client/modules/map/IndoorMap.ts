import type { BBox } from 'geojson';
import { IndoorMapGeoJSON, LevelsRange } from './Types';
import gareGeoJSON from '@/assets/geojson/gare.json';
import GeoJsonHelper from './GeojsonHelper';

export interface IndoorMap {
  id: string;
  bounds: BBox;
  geojson: IndoorMapGeoJSON;
  levelsRange: LevelsRange;
}

// Instantiating globally accessible indoor maps:

const { bounds, levelsRange } = GeoJsonHelper.extractLevelsRangeAndBounds(
  gareGeoJSON as IndoorMapGeoJSON
);
const gareIndoorMap: IndoorMap = {
  id: 'gare',
  bounds: bounds,
  geojson: gareGeoJSON as IndoorMapGeoJSON,
  levelsRange: levelsRange,
};

export const indoorMaps: IndoorMap[] = [gareIndoorMap];
