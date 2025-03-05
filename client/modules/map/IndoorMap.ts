import type { BBox } from 'geojson';
import { IndoorMapGeoJSON, LevelsRange } from './Types';
import gareGeoJSON from '@/assets/geojson/gare.json';
import hallFoorsGeoJson from '@/assets/geojson/hallFloors.json'
import GeoJsonHelper from './GeojsonHelper';

export interface IndoorMap {
  id: string;
  bounds: BBox;
  geojson: IndoorMapGeoJSON;
  levelsRange: LevelsRange;
}

// Instantiating globally accessible indoor maps:

const { bounds, levelsRange } = GeoJsonHelper.extractLevelsRangeAndBounds(
  // gareGeoJSON as IndoorMapGeoJSON
  hallFoorsGeoJson as IndoorMapGeoJSON  

);
const hallIndoorMap: IndoorMap = {
  id: 'hall',
  bounds: bounds,
  geojson: hallFoorsGeoJson  as IndoorMapGeoJSON,
  levelsRange: levelsRange,
};

export const indoorMaps: IndoorMap[] = [hallIndoorMap];
