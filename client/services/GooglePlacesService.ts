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

class GooglePlacesService {}

export default new GooglePlacesService();
