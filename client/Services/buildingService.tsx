import { Coordinates } from '@/modules/map/MapContext';
import {
  HALL_BUILDING_COORDINATES,
  MOLSON_BUILDING_COORDINATES,
  FAUBOURG_BUILDING_COORDINATES,
} from '@/constants/CampusBuildingCoordinates';

const BUILDING_ACRONYM_COORDINATES = {
  H: HALL_BUILDING_COORDINATES,
  MB: MOLSON_BUILDING_COORDINATES,
  FB: FAUBOURG_BUILDING_COORDINATES,
};

export function getBuildingCoordinates(building: string): Coordinates {
  const acronym = getBuildingAcronym(building.trim());
  if (!(acronym in BUILDING_ACRONYM_COORDINATES)) return [0, 0];
  return BUILDING_ACRONYM_COORDINATES[acronym as keyof typeof BUILDING_ACRONYM_COORDINATES];
}

function getBuildingAcronym(building: string) {
  return building.match(/^[A-Za-z]+/)?.[0].toUpperCase() || '';
}
