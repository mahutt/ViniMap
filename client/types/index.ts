import { Location } from '@/modules/map/Types';

export interface Task {
  id: string;
  text: string;
  location: Location | null;
  startTime: Date | null;
  duration: number | null; // In minutes
  data?: {
    time: string;
  };
}

export type * from '@/modules/map/Types';
