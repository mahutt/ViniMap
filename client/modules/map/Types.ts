/*
Internal representation of a pair of coordinates.
Coordinates: [longitude, latitude]
*/
export type Coordinates = [number, number];

export interface Segment {
  id: string;
  type: 'solid' | 'dashed';
  steps: Coordinates[];
}

export interface Route {
  duration: number;
  distance: number;
  segments: Segment[];
}
