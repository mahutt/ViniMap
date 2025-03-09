import type { BBox } from 'geojson';
import { IndoorMapGeoJSON, LevelsRange } from './Types';
import gareGeoJSON from '@/assets/geojson/gare.json';

import hallFoorsGeoJson from '@/assets/geojson/hallFloors.json'
import jmsbFloors from '@/assets/geojson/jmsbFloors.json'


import GeojsonService from '@/services/GeojsonService';


export interface IndoorMap {
  id: string;
  bounds: BBox;
  geojson: IndoorMapGeoJSON;
  levelsRange: LevelsRange;
}

// Instantiating globally accessible indoor maps:


const { bounds, levelsRange } = GeojsonService.extractLevelsRangeAndBounds(
  // gareGeoJSON as IndoorMapGeoJSON
  hallFoorsGeoJson as IndoorMapGeoJSON  


);
const hallIndoorMap: IndoorMap = {
  id: 'hall',
  bounds: bounds,
  geojson: hallFoorsGeoJson  as IndoorMapGeoJSON,
  levelsRange: levelsRange,
};
const jmsbIndoorMap: IndoorMap = {
  id: 'jmsb',
  bounds: GeojsonService.extractLevelsRangeAndBounds(jmsbFloors as IndoorMapGeoJSON).bounds,
  geojson: jmsbFloors  as IndoorMapGeoJSON,
  levelsRange:  GeojsonService.extractLevelsRangeAndBounds(jmsbFloors as IndoorMapGeoJSON).levelsRange,
};


export const indoorMaps: IndoorMap[] = [hallIndoorMap,jmsbIndoorMap];
