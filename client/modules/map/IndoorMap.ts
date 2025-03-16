import { IndoorMap, IndoorMapGeoJSON } from './Types';
import LocalLocations from '@/services/LocalLocations';
import { bboxCenter } from './IndoorMapUtils';

import hallFloorsGeoJson from '@/assets/geojson/hallFloors.json';
import jmsbFloors from '@/assets/geojson/jmsbFloors.json';
import VLandVEfloors from '@/assets/geojson/VLandVEfloors.json';

import GeojsonService from '@/services/GeojsonService';
import type { Feature, Polygon } from 'geojson';
import { center } from '@turf/turf';

const getAllRooms = (geojson: IndoorMapGeoJSON): Feature<Polygon>[] => {
  const rooms: Feature<Polygon>[] = [];
  geojson.features.forEach((feature) => {
    if (feature.properties?.ref) {
      rooms.push(feature as Feature<Polygon>);
    }
  });
  return rooms;
};

const rawIndoorMaps = [
  {
    id: 'Hall Building',
    geojson: hallFloorsGeoJson,
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
  const rooms = getAllRooms(indoorMap.geojson);
  for (const room of rooms) {
    const roomRef = room.properties?.ref;
    if (typeof roomRef !== 'string') {
      continue;
    }
    LocalLocations.getInstance().add(roomRef, (name: string) => {
      return {
        name,
        coordinates: center(room).geometry.coordinates,
        data: {
          address: indoorMap.id,
          level: parseFloat(room.properties?.level),
          indoorMap: indoorMap,
          ref: roomRef,
          feature: room,
        },
      };
    });
  }
  return indoorMap;
});

export { indoorMaps };
