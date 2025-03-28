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
import sdGeojson from '@/assets/geojson/sd.json';
import pcGeojson from '@/assets/geojson/pc.json';
import raGeojson from '@/assets/geojson/ra.json';
import psGeojson from '@/assets/geojson/ps.json';
import pyGeojson from '@/assets/geojson/py.json';
import rfGeojson from '@/assets/geojson/rf.json';
import ccGeojson from '@/assets/geojson/cc.json';
import adGeojson from '@/assets/geojson/ad.json';
import fcGeojson from '@/assets/geojson/fc.json';
import cjGeojson from '@/assets/geojson/cj.json';
import siGeojson from '@/assets/geojson/si.json';
import hcGeojson from '@/assets/geojson/hc.json';
import hbGeojson from '@/assets/geojson/hb.json';
import haGeojson from '@/assets/geojson/ha.json';
import huGeojson from '@/assets/geojson/hu.json';
import spGeojson from '@/assets/geojson/sp.json';
import geGeojson from '@/assets/geojson/ge.json';

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
    mapboxIds: [22080570],
    geojson: hallGeojson,
  },
  {
    id: 'Webster Library',
    mapboxIds: [22080572],
    geojson: websterGeojson,
  },
  {
    id: 'EV Building',
    mapboxIds: [1110145740, 1110145744, 1110145741, 356036803, 1110145743],
    geojson: evGeojson,
  },
  {
    id: 'ER Building',
    mapboxIds: [103896385],
    geojson: erGeojson,
  },
  {
    id: 'Learning Square',
    mapboxIds: [979438074],
    geojson: lsGeojson,
  },
  {
    id: 'John Molson School of Business',
    mapboxIds: [1109876433, 1109876436, 1109876434, 1109876435],
    geojson: jmsbGeojson,
  },
  {
    id: 'FB - Faubourg Tower',
    mapboxIds: [103248058],
    geojson: fbGeojson,
  },
  {
    id: 'Grey Nuns Building',
    mapboxIds: [17189298],
    geojson: nunsGeojson,
  },
  {
    id: 'CL Building',
    mapboxIds: [103248055],
    geojson: clGeojson,
  },
  {
    id: 'VA - Visual Arts Building',
    mapboxIds: [103521746],
    geojson: vaGeojson,
  },
  {
    id: 'VLandVE',
    mapboxIds: [604324442, 604324441, 47332009, 604324443],
    geojson: VLandVEfloors,
  },
  {
    id: 'Stinger Dome',
    mapboxIds: [129437736],
    geojson: sdGeojson,
  },
  {
    id: 'Perform Center',
    mapboxIds: [604019520],
    geojson: pcGeojson,
  },
  {
    id: 'Recreation and Althletics Complex',
    mapboxIds: [47332005],
    geojson: raGeojson,
  },
  {
    id: 'Physical Services',
    mapboxIds: [47332006],
    geojson: psGeojson,
  },
  {
    id: 'Psychology Building',
    mapboxIds: [17887805],
    geojson: pyGeojson,
  },
  {
    id: 'Loyola Jesuit Hall and Conference Center',
    mapboxIds: [604324455],
    geojson: rfGeojson,
  },
  {
    id: 'Central Building',
    mapboxIds: [604324456],
    geojson: ccGeojson,
  },
  {
    id: 'Administration Building',
    mapboxIds: [604324457],
    geojson: adGeojson,
  },
  {
    id: 'F.C. Smith Building',
    mapboxIds: [47332003],
    geojson: fcGeojson,
  },
  {
    id: 'Communication Studies and Journalism Building',
    mapboxIds: [47332007],
    geojson: cjGeojson,
  },
  {
    id: 'Saint Ignatius of Loyola Church',
    mapboxIds: [47331997],
    geojson: siGeojson,
  },
  {
    id: 'Hingston Hall (HC)',
    mapboxIds: [604324438],
    geojson: hcGeojson,
  },
  {
    id: 'Hingston Hall (HB)',
    mapboxIds: [17887804],
    geojson: hbGeojson,
  },
  {
    id: 'Hingston Hall (HA)',
    mapboxIds: [17887803],
    geojson: haGeojson,
  },
  {
    id: 'Applied Science Hub',
    mapboxIds: [795012497],
    geojson: huGeojson,
  },
  {
    id: 'Richard J. Renaud Science Complex',
    mapboxIds: [47331993],
    geojson: spGeojson,
  },
  {
    id: 'Centre for Structural and Functional Genomics',
    mapboxIds: [545014554],
    geojson: geGeojson,
  },
];

const indoorMaps: IndoorMap[] = rawIndoorMaps.map((rawIndoorMap) => {
  const { bounds, levelsRange } = GeojsonService.extractLevelsRangeAndBounds(
    rawIndoorMap.geojson as IndoorMapGeoJSON
  );
  const indoorMap: IndoorMap = {
    id: rawIndoorMap.id,
    mapboxIds: rawIndoorMap.mapboxIds,
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
