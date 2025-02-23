import { Coordinates } from '@/modules/map/MapContext';
import {
  HALL_BUILDING_COORDINATES,
  MOLSON_BUILDING_COORDINATES,
  FAUBOURG_BUILDING_COORDINATES,
} from '@/constants/CampusBuildingCoordinates';

export function getBuildingCoordinates(building: string): Coordinates {
  if (building === null) {
    return [0, 0];
  }
  const acronym = getBuildingAcronym(building).trim();
  if (acronym === 'H') {
    return HALL_BUILDING_COORDINATES;
  }
  if (acronym === 'MB') {
    return MOLSON_BUILDING_COORDINATES;
  }
  if (acronym === 'FB') {
    return FAUBOURG_BUILDING_COORDINATES;
  }
  return [0, 0];
}

function getBuildingAcronym(building: string) {
  return building.match(/^[A-Za-z]+/)?.[0] || '';
}
