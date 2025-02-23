import { getBuildingCoordinates } from '../../services/BuildingService';
import {
  HALL_BUILDING_COORDINATES,
  MOLSON_BUILDING_COORDINATES,
  FAUBOURG_BUILDING_COORDINATES,
} from '@/constants/CampusBuildingCoordinates';

describe('getBuildingCoordinates', () => {
  test('should return Hall Building coordinates for H-prefixed room', () => {
    expect(getBuildingCoordinates('H-110')).toEqual(HALL_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('H110')).toEqual(HALL_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('H 110')).toEqual(HALL_BUILDING_COORDINATES);
  });

  test('should return Molson Building coordinates for MB-prefixed room', () => {
    expect(getBuildingCoordinates('MB-110')).toEqual(MOLSON_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('MB110')).toEqual(MOLSON_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('MB 110')).toEqual(MOLSON_BUILDING_COORDINATES);
  });

  test('should return Faubourg Building coordinates for FB-prefixed room', () => {
    expect(getBuildingCoordinates('FB-110')).toEqual(FAUBOURG_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('FB110')).toEqual(FAUBOURG_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('FB 110')).toEqual(FAUBOURG_BUILDING_COORDINATES);
  });

  test('should handle lowercase building prefixes', () => {
    expect(getBuildingCoordinates('h-110')).toEqual(HALL_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('mb-110')).toEqual(MOLSON_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('fb-110')).toEqual(FAUBOURG_BUILDING_COORDINATES);
  });

  test('should return [0, 0] for unknown building prefixes', () => {
    expect(getBuildingCoordinates('XX-110')).toEqual([0, 0]);
    expect(getBuildingCoordinates('123-456')).toEqual([0, 0]);
    expect(getBuildingCoordinates('')).toEqual([0, 0]);
  });

  test('should handle various room number formats', () => {
    expect(getBuildingCoordinates('H-001')).toEqual(HALL_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('H-1234')).toEqual(HALL_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('H-12.34')).toEqual(HALL_BUILDING_COORDINATES);
  });

  test('should handle whitespace in room numbers', () => {
    expect(getBuildingCoordinates('  H-110  ')).toEqual(HALL_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('MB  110')).toEqual(MOLSON_BUILDING_COORDINATES);
    expect(getBuildingCoordinates('FB\t110')).toEqual(FAUBOURG_BUILDING_COORDINATES);
  });
});
