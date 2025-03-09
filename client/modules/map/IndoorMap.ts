import type { BBox } from 'geojson';
import { IndoorMapGeoJSON, LevelsRange } from './Types';
import LocalLocations from '@/services/TrieService';
import { bboxCenter } from './Utils';
import hallFoorsGeoJson from '@/assets/geojson/hallFloors.json';
import GeojsonService from '@/services/GeojsonService';

export interface IndoorMap {
  id: string;
  bounds: BBox;
  geojson: IndoorMapGeoJSON;
  levelsRange: LevelsRange;
}

const getAllRoomRefs = (geojson: IndoorMapGeoJSON): string[] => {
  const roomRefs: string[] = [];
  geojson.features.forEach((feature) => {
    if (feature.properties?.ref) {
      roomRefs.push(feature.properties.ref);
    }
  });
  return roomRefs;
};

// Instantiating globally accessible indoor maps:

const { bounds, levelsRange } = GeojsonService.extractLevelsRangeAndBounds(
  // gareGeoJSON as IndoorMapGeoJSON
  hallFoorsGeoJson as IndoorMapGeoJSON
);
const hallIndoorMap: IndoorMap = {
  id: 'Hall Building',
  bounds: bounds,
  geojson: hallFoorsGeoJson as IndoorMapGeoJSON,
  levelsRange: levelsRange,
};

const HallRooms = getAllRoomRefs(hallIndoorMap.geojson);
LocalLocations.getInstance().addAll(HallRooms, (name: string) => {
  return {
    name,
    coordinates: bboxCenter(hallIndoorMap.bounds),
    data: {
      address: hallIndoorMap.id,
    },
  };
});

export const indoorMaps: IndoorMap[] = [hallIndoorMap];
