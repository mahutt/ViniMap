import { Coordinates, Location } from '@/modules/map/Types';
import { calculateEuclideanDistance } from '@/modules/map/MapUtils';
import poiFeatureCollection from '@/assets/geojson/pois.json';
import type { Feature, FeatureCollection, Point } from 'geojson';
import LocalLocations from './LocalLocations';

const dayMap: Record<number, string> = {
  0: 'Su',
  1: 'Mo',
  2: 'Tu',
  3: 'We',
  4: 'Th',
  5: 'Fr',
  6: 'Sa',
};

const isInDayRange = (
  currentDayIndex: number,
  startDayIndex: number,
  endDayIndex: number
): boolean => {
  if (startDayIndex <= endDayIndex) {
    return currentDayIndex >= startDayIndex && currentDayIndex <= endDayIndex;
  }
  return currentDayIndex >= startDayIndex || currentDayIndex <= endDayIndex;
};

const isCurrentDayInRange = (currentDayCode: string, dayRange: string): boolean => {
  const dayRanges = dayRange.split(',');
  const days = Object.values(dayMap);
  const currentDayIndex = days.indexOf(currentDayCode);

  if (currentDayIndex === -1) {
    return false;
  }

  for (const range of dayRanges) {
    if (!range.includes('-')) {
      if (range === currentDayCode) {
        return true;
      }
      continue;
    }
    const [startDay, endDay] = range.split('-');
    const startDayIndex = days.indexOf(startDay);
    const endDayIndex = days.indexOf(endDay);

    if (startDayIndex === -1 || endDayIndex === -1) {
      continue;
    }

    if (isInDayRange(currentDayIndex, startDayIndex, endDayIndex)) {
      return true;
    }
  }

  return false;
};

const isCurrentTimeInRange = (currentTime: number, timeRange: string): boolean => {
  const [startTime, endTime] = timeRange.split('-');

  const startParts = startTime.split(':').map(Number);
  const endParts = endTime.split(':').map(Number);
  const startTimeMinutes = startParts[0] * 60 + (startParts[1] || 0);

  let endTimeMinutes = endParts[0] * 60 + (endParts[1] || 0);
  if (endParts[0] === 24) {
    endTimeMinutes = 24 * 60;
  }
  if (endTimeMinutes <= startTimeMinutes) {
    endTimeMinutes += 24 * 60;
  }

  return currentTime >= startTimeMinutes && currentTime < endTimeMinutes;
};

const isCurrentlyOpen = (openingHours?: string): boolean => {
  if (!openingHours) return false;

  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  const currentDayCode = dayMap[currentDay];

  const ruleSets = openingHours.split(';').map((set) => set.trim());

  for (const ruleSet of ruleSets) {
    if (!ruleSet) continue;

    const parts = ruleSet.split(' ');
    if (parts.length < 2) continue;

    const dayRange = parts[0];
    const timeRange = parts[1];

    if (!isCurrentDayInRange(currentDayCode, dayRange)) {
      continue;
    }

    if (timeRange && isCurrentTimeInRange(currentTime, timeRange)) {
      return true;
    }
  }

  return false;
};

const extractLocation = (feature: Feature<Point>): Location => {
  return {
    name: feature.properties?.name,
    coordinates: feature.geometry.coordinates,
    data: {
      address: feature.properties?.addr,
      isOpen: isCurrentlyOpen(feature.properties?.opening_hours),
      hours: feature.properties?.opening_hours,
      category: feature.properties?.description,
      type: feature.properties?.amenity,
    },
  };
};

class PointsOfInterestService {
  private readonly featureCollection: FeatureCollection<Point>;

  constructor() {
    this.featureCollection = poiFeatureCollection as FeatureCollection<Point>;
  }

  getFeatureCollection(): FeatureCollection<Point> {
    return this.featureCollection;
  }

  findClosestPOI(coordinates: Coordinates, radius: number = 0.0005): Location | null {
    let closestFeature: Feature<Point> | null = null;
    let closestDistance = Infinity;

    for (const feature of this.featureCollection.features) {
      const distance = calculateEuclideanDistance(coordinates, feature.geometry.coordinates);

      if (distance <= radius && distance < closestDistance) {
        closestDistance = distance;
        closestFeature = feature;
      }
    }

    if (closestFeature === null) return null;
    return extractLocation(closestFeature);
  }

  getPOIByName(name: string): Location | null {
    const poi = this.featureCollection.features.find((f) => f.properties?.name === name);
    if (!poi) return null;
    return extractLocation(poi);
  }
}

const pointsOfInterestService = new PointsOfInterestService();
for (const poi of pointsOfInterestService.getFeatureCollection().features) {
  if (!poi.properties?.name) continue;
  LocalLocations.getInstance().add(poi.properties.name, (_: string) => {
    return extractLocation(poi);
  });
}

export default pointsOfInterestService;
