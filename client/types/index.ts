import { Location } from '@/modules/map/Types';

export interface Task {
  id: string;
  text: string;
  location: Location;
  startTime: Date;
  duration: number | null; // In minutes
}

export type * from '@/modules/map/Types';
