import { IndoorMap, IndoorMapGeoJSON } from './Types';
import LocalLocations from '@/services/LocalLocations';

import hallGeojson from '@/assets/geojson/hall.json';
import jmsbGeojson from '@/assets/geojson/jmsb.json';
import VLandVEfloors from '@/assets/geojson/VLandVEfloors.json';
import websterGeojson from '@/assets/geojson/webster.json';
import evGeojson from '@/assets/geojson/ev.json';
import erGeojson from '@/assets/geojson/er.json';
import lsGeojson from '@/assets/geojson/ls.json';
import clGeojson from '@/assets/geojson/cl.json';
import fbGeojson from '@/assets/geojson/fb.json';
import nunsGeojson from '@/assets/geojson/nuns.json';
import vaGeojson from '@/assets/geojson/va.json';

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
    mapboxId: 22080570,
    geojson: hallGeojson,
  },
  {
    id: 'Webster Library',
    mapboxId: 22080572,
    geojson: websterGeojson,
  },
  {
    id: 'EV Building',
    mapboxId: 103248064,
    geojson: evGeojson,
  },
  {
    id: 'ER Building',
    mapboxId: 103896385,
    geojson: erGeojson,
  },
  {
    id: 'Learning Square',
    mapboxId: 979438074,
    geojson: lsGeojson,
  },
  {
    id: 'John Molson School of Business',
    mapboxId: 22080581,
    geojson: jmsbGeojson,
  },
  {
    id: 'FB - Faubourg Tower',
    mapboxId: 103248058,
    geojson: fbGeojson,
  },
  {
    id: 'Grey Nuns Building',
    mapboxId: 17189298,
    geojson: nunsGeojson,
  },
  {
    id: 'CL Building',
    mapboxId: 103248055,
    geojson: clGeojson,
  },
  {
    id: 'VA - Visual Arts Building',
    mapboxId: 103521746,
    geojson: vaGeojson,
  },
  {
    id: 'VLandVE',
    mapboxId: -1,
    geojson: VLandVEfloors,
  },
];

const indoorMaps: IndoorMap[] = rawIndoorMaps.map((rawIndoorMap) => {
  const { bounds, levelsRange } = GeojsonService.extractLevelsRangeAndBounds(
    rawIndoorMap.geojson as IndoorMapGeoJSON
  );
  const indoorMap: IndoorMap = {
    id: rawIndoorMap.id,
    mapboxId: rawIndoorMap.mapboxId,
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
