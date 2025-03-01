import { Coordinates } from '@/modules/map/MapContext';

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY as string;

export interface PlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now: boolean;
  };
}

interface PlacesResponse {
  results: PlaceResult[];
  status: string;
  next_page_token?: string;
}

class GooglePlacesService {
  async fetchNearbyOutdoorPlaces(
    coordinates: Coordinates,
    radius: number = 5000
  ): Promise<PlaceResult[]> {
    try {
      const pointsOfInterestTypes = [
        // Food & Drink
        'restaurant',
        'cafe',
        'bar',
        'bakery',

        // Shopping
        'mall',
        'market',
        'grocery',
        'supermarket',
        'store',
        'shop',
        'shopping',

        // Outdoor & Recreation
        'park',
        'trail',
        'rink',
        'gym',
        'pool',
        'fitness',
        'court',
        'climbing',
        'sport',
        'garden',

        // Entertainment & Culture
        'movie',
        'art',
        'theatre',
        'museum',
        'gallery',
        'stadium',

        // Services
        'atm',
        'bank',
        'gas_station',
        'pharmacy',

        // Travel & Transportation
        'metro',
        'train',
        'bus',
        'hotel',
        'car',
        'rental',
        'bixi',
        'parking',
      ];

      const uniqueResults = new Map<string, PlaceResult>();

      for (const type of pointsOfInterestTypes) {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates[1]},${coordinates[0]}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;

        const response = await fetch(apiUrl);
        const data: PlacesResponse = await response.json();

        if (data.status === 'OK' && data.results) {
          data.results.forEach((place) => {
            uniqueResults.set(place.place_id, place);
          });
        }
      }

      return Array.from(uniqueResults.values()).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } catch (error) {
      console.error('Error fetching outdoor places:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,user_ratings_total,types,photos,opening_hours,website,formatted_phone_number&key=${GOOGLE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        return data.result;
      }

      throw new Error(`Failed to get place details: ${data.status}`);
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }
}

export default new GooglePlacesService();
