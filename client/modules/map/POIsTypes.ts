export type POIType =
  | 'bixi'
  | 'metro'
  | 'bus'
  | 'restaurant'
  | 'park'
  | 'library'
  | 'shopping'
  | 'other';

export interface OpeningHours {
  isOpen: boolean;
  hours: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  type: POIType;
  openingHours: OpeningHours;
  description?: string;
}

export interface POIData {
  pointsOfInterest: PointOfInterest[];
}
