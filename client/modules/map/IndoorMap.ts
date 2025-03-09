import type { BBox } from 'geojson';
import { IndoorMapGeoJSON, LevelsRange } from './Types';
import LocalLocations from '@/services/LocalLocations';
import { bboxCenter } from './IndoorMapUtils';

import hallFoorsGeoJson from '@/assets/geojson/hallFloors.json';
import jmsbFloors from '@/assets/geojson/jmsbFloors.json';
import VLandVEfloors from '@/assets/geojson/VLandVEfloors.json';

import GeojsonService from '@/services/GeojsonService';

interface IndoorMap {
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

const rawIndoorMaps = [
  {
    id: 'Hall Building',
    geojson: hallFoorsGeoJson,
  },
  {
    id: 'John Molson School of Business',
    geojson: jmsbFloors,
  },
  {
    id: 'VLandVE',
    geojson: VLandVEfloors,
  },
];

const indoorMaps: IndoorMap[] = rawIndoorMaps.map((rawIndoorMap) => {
  const { bounds, levelsRange } = GeojsonService.extractLevelsRangeAndBounds(
    rawIndoorMap.geojson as IndoorMapGeoJSON
  );
  const indoorMap: IndoorMap = {
    id: rawIndoorMap.id,
    bounds: bounds,
    geojson: rawIndoorMap.geojson as IndoorMapGeoJSON,
    levelsRange: levelsRange,
  };
  const rooms = getAllRoomRefs(indoorMap.geojson);
  LocalLocations.getInstance().addAll(rooms, (name: string) => {
    return {
      name,
      coordinates: bboxCenter(indoorMap.bounds),
      data: {
        address: indoorMap.id,
      },
    };
  });
  return indoorMap;
});

export { indoorMaps, IndoorMap };
