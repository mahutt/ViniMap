import { Coordinates } from '@/modules/map/Types';
import poiData from '@/data/PointsOfInterest.json';
import { POIData, PointOfInterest } from '../modules/map/PointsOfInterestTypes';
import { calculateEuclideanDistance } from '@/modules/map/MapUtils';

import LocalLocations from './LocalLocations';
for (const poi of poiData.pointsOfInterest) {
  LocalLocations.getInstance().add(poi.name, (name: string) => {
    return {
      name: name,
      coordinates: poi.coordinates as Coordinates,
      data: {
        address: poi.address,
        isOpen: poi.openingHours.isOpen,
        hours: poi.openingHours.hours,
        description: poi.description,
      },
    };
  });
}
class PointsOfInterestService {
  private readonly poiData: POIData;

  constructor() {
    this.poiData = poiData as POIData;
  }

  getAllPOIs(): PointOfInterest[] {
    return this.poiData.pointsOfInterest;
  }

  getPOIsByType(type: string): PointOfInterest[] {
    return this.poiData.pointsOfInterest.filter((poi) => poi.type === type);
  }

  findClosestPOI(coordinates: Coordinates, radius: number = 0.0005): PointOfInterest | null {
    let closestPOI: PointOfInterest | null = null;
    let closestDistance = Infinity;

    for (const poi of this.poiData.pointsOfInterest) {
      const distance = calculateEuclideanDistance(coordinates, poi.coordinates);

      if (distance <= radius && distance < closestDistance) {
        closestDistance = distance;
        closestPOI = poi;
      }
    }

    return closestPOI;
  }

  getPOIById(id: string): PointOfInterest | undefined {
    return this.poiData.pointsOfInterest.find((poi) => poi.id === id);
  }

  shouldShowPOIs(zoomLevel: number): boolean {
    // Show POIs when zoomed in enough
    return zoomLevel >= 15;
  }
}

export default new PointsOfInterestService();
