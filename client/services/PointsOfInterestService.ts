import { Coordinates, Location } from '@/modules/map/Types';
import { calculateEuclideanDistance } from '@/modules/map/MapUtils';
import poiFeatureCollection from '@/assets/geojson/pois.json';
import type { Feature, FeatureCollection, Point } from 'geojson';
import LocalLocations from './LocalLocations';

const extractLocation = (feature: Feature<Point>): Location => {
  return {
    name: feature.properties?.name,
    coordinates: feature.geometry.coordinates,
    data: {
      address: feature.properties?.addr,
      // Currently, we assume all POIs are open
      isOpen: true,
      hours: feature.properties?.opening_hours,
      category: feature.properties?.description,
      type: feature.properties?.amenity,
    },
  };
};
class PointsOfInterestService {
  private readonly featureCollection: FeatureCollection<Point>;

  constructor() {
    // We only support POIs that are Points
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
}

const pointsOfInterestService = new PointsOfInterestService();

// Add outdoor POIs to location input autocomplete
for (const poi of pointsOfInterestService.getFeatureCollection().features) {
  if (!poi.properties?.name) continue;
  LocalLocations.getInstance().add(poi.properties.name, (_: string) => {
    return extractLocation(poi);
  });
}

export default pointsOfInterestService;
