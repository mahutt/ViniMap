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
    id: 'Hall Building (H)',
    mapboxIds: [22080570],
    geojson: hallGeojson,
    addr: '1455 Blvd. De Maisonneuve Ouest, Montreal, Quebec H3G 1M8',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Webster Library (LB)',
    mapboxIds: [
      1110900192, 1110900193, 1110900197, 1110900196, 1110900194, 1110900195, 1110900190,
      1110900191,
    ],
    geojson: websterGeojson,
    addr: 'Pavillion J.W. McConnell Bldg, 1400 Maisonneuve Blvd W, Montreal, Quebec H3G 1M8',
    opening_hours: '24/7',
  },
  {
    id: 'Engineering, CS, and VA Integrated Complex (EV)',
    mapboxIds: [1110145740, 1110145744, 1110145741, 356036803, 1110145743],
    geojson: evGeojson,
    addr: '1515 Saint-Catherine St W, Montreal, Quebec H3G 2H7',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'ER Building (ER)',
    mapboxIds: [103896385],
    geojson: erGeojson,
    addr: '2155 Guy St, Montreal, Quebec H3H 2L9',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Learning Square (LS)',
    mapboxIds: [979438074],
    geojson: lsGeojson,
    addr: '1535 Blvd. De Maisonneuve Ouest, Montreal, Quebec H3G 1M9',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'John Molson Building (MB)',
    mapboxIds: [1109876433, 1109876436, 1109876434, 1109876435],
    geojson: jmsbGeojson,
    addr: '1600 Blvd. De Maisonneuve Ouest, Montreal, Quebec H3H 0A1',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Faubourg Tower (FB)',
    mapboxIds: [103248058],
    geojson: fbGeojson,
    addr: '1600 Saint-Catherine St W, Montreal, Quebec H3H 2S7',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Grey Nuns Building (GN)',
    mapboxIds: [17189298],
    geojson: nunsGeojson,
    addr: '1190 Guy St, Montreal, Quebec H3H 2L4',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'CL Building (CL)',
    mapboxIds: [103248055],
    geojson: clGeojson,
    addr: '1665 Saint-Catherine St W, Montreal, Quebec H3H 2S7',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Visual Arts Building (VA)',
    mapboxIds: [103521746],
    geojson: vaGeojson,
    addr: '1395 René-Lévesque Blvd W, Montreal, Quebec H3G 2M5',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Vanier Library (VL / VE)',
    mapboxIds: [604324442, 604324441, 47332009, 604324443],
    geojson: VLandVEfloors,
    addr: '7141 Sherbrooke St W, Montreal, Quebec H4B 1R6',
    opening_hours: '24/7',
  },
  {
    id: 'Stinger Dome (SD)',
    mapboxIds: [129437736],
    geojson: sdGeojson,
    addr: '7200 Sherbrooke St W, Montreal, Quebec H4B 1R3',
    opening_hours: 'Mo-Su 09:00-22:00',
  },
  {
    id: 'Perform Center (PC)',
    mapboxIds: [604019520],
    geojson: pcGeojson,
    addr: '7200 Sherbrooke St W, Montreal, Quebec H4B 1R6',
    opening_hours: 'Mo-Fr 06:30-22:00; Sa-Su 08:00-18:00',
  },
  {
    id: 'Recreation and Althletics Complex (RA)',
    mapboxIds: [47332005],
    geojson: raGeojson,
    addr: '7200 Sherbrooke St W, Montreal, Quebec H4B 1R6',
    opening_hours: 'Mo-Fr 06:30-22:00; Sa-Su 08:00-18:00',
  },
  {
    id: 'Physical Services (PS)',
    mapboxIds: [47332006],
    geojson: psGeojson,
    addr: 'Montreal, Quebec H4B 2B9',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Psychology Building (PY)',
    mapboxIds: [17887805],
    geojson: pyGeojson,
    addr: '7141 Sherbrooke St W, Montreal, Quebec H4B 1R6',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Loyola Jesuit Hall and Conference Center (RF)',
    mapboxIds: [604324455],
    geojson: rfGeojson,
    addr: '7141 Sherbrooke St W, Montreal, Quebec H4B 1E1',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Central Building (CC)',
    mapboxIds: [604324456],
    geojson: ccGeojson,
    addr: '7141 Sherbrooke St W, Montreal, Quebec H4B 1E1',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Administration Building (AD)',
    mapboxIds: [604324457],
    geojson: adGeojson,
    addr: '7141 Sherbrooke St W, Montreal, Quebec H4B 1E1',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'F.C. Smith Building (FC)',
    mapboxIds: [47332003],
    geojson: fcGeojson,
    addr: '7141 Sherbrooke St W, Montreal, Quebec H4B 1R6',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Communication Studies and Journalism Building (CJ)',
    mapboxIds: [47332007],
    geojson: cjGeojson,
    addr: '7141 Sherbrooke St W, Montreal, Quebec H4B 1R6',
    opening_hours: 'Mo-Fr 08:00-18:00',
  },
  {
    id: 'Saint Ignatius of Loyola Church (SI)',
    mapboxIds: [47331997],
    geojson: siGeojson,
    addr: '4455 Rue West Broadway, Montréal, QC H4B 2A7',
    opening_hours: 'Mo-Fr 08:00-16:00; Sa 15:45-17:30; Su 10:00-11:00',
  },
  {
    id: 'Hingston Hall (HC)',
    mapboxIds: [604324438],
    geojson: hcGeojson,
    addr: 'Hingston Hall C, Montreal, Quebec H4B, Canada',
    opening_hours: '24/7',
  },
  {
    id: 'Hingston Hall (HB)',
    mapboxIds: [17887804],
    geojson: hbGeojson,
    addr: 'Hingston Hall B, Montreal, Quebec H4B, Canada',
    opening_hours: '24/7',
  },
  {
    id: 'Hingston Hall (HA)',
    mapboxIds: [17887803],
    geojson: haGeojson,
    addr: 'Hingston Hall A, Montreal, Quebec H4B, Canada',
    opening_hours: '24/7',
  },
  {
    id: 'Applied Science Hub (HU)',
    mapboxIds: [795012497],
    geojson: huGeojson,
    addr: '7141 Sherbrooke St W, Montreal, Quebec H4B 1R6',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Richard J. Renaud Science Complex (SP)',
    mapboxIds: [47331993],
    geojson: spGeojson,
    addr: '3475 Rue West Broadway, Montréal, QC H4B 2A7',
    opening_hours: 'Mo-Fr 09:00-17:00',
  },
  {
    id: 'Centre for Structural and Functional Genomics (GE)',
    mapboxIds: [545014554],
    geojson: geGeojson,
    addr: '7141 Sherbrooke St W, Montreal, Quebec H4B 1R6',
    opening_hours: 'Mo-Fr 09:00-17:00',
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
    addr: rawIndoorMap.addr,
    opening_hours: rawIndoorMap.opening_hours,
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

const campusMapboxIds = indoorMaps.flatMap((indoorMap) => indoorMap.mapboxIds);

export { indoorMaps, campusMapboxIds };
