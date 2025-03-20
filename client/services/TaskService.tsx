import { getRoute } from '@/modules/map/MapService';
import { Route, Task, Segment } from '@/modules/map/Types';

export class TaskService {
  static async getOptimalRouteForPaths(listOfTasks: Task[]): Promise<Route> {
    if (listOfTasks.length <= 0) {
      throw new Error('No tasks are selected');
    }

    let totalDistance = 0;
    let totalDuration = 0;
    let fullSegments: Segment[] = [];

    for (let i = 0; i < listOfTasks.length - 1; i++) {
      const startCoordinates = listOfTasks[i].location;
      const endCoordinates = listOfTasks[i + 1].location;

      try {
        const route = await getRoute(startCoordinates, endCoordinates, 'walking');

        if (route?.segments?.length) {
          totalDistance += route.distance;
          totalDuration += route.duration;

          fullSegments = [...fullSegments, ...route.segments];
        }
      } catch (error) {
        console.error(`Error generating route from task ${i} to ${i + 1}:`, error);
      }
    }
    return {
      duration: totalDuration,
      distance: totalDistance,
      segments: fullSegments,
    };
  }
}
