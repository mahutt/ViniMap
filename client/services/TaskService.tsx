import { getRoute } from '@/modules/map/MapService';
import { Route, Task, Segment, TaskRouteDescription } from '@/modules/map/Types';

export class TaskService {
  static async getOptimalRouteForPaths(
    listOfTasks: Task[],
    setTaskTime: (taskTime: TaskRouteDescription[]) => void
  ): Promise<Route> {
    if (listOfTasks.length <= 0) {
      throw new Error('No tasks are selected');
    }

    let totalDistance = 0;
    let totalDuration = 0;
    let fullSegments: Segment[] = [];

    let taskDescriptions: TaskRouteDescription[] = [];

    for (let i = 0; i < listOfTasks.length - 1; i++) {
      const startCoordinates = listOfTasks[i].location;
      const endCoordinates = listOfTasks[i + 1].location;

      try {
        const route = await getRoute(startCoordinates, endCoordinates, 'walking');

        if (route?.segments?.length) {
          totalDistance += route.distance;
          totalDuration += route.duration;

          if (route.duration >= 3600) {
            let taskDescription = {
              text: listOfTasks[i].text,
              time: (route.duration / 3600).toFixed(2) + ' h',
            };
            taskDescriptions.push(taskDescription);
          } else {
            let taskDescription = {
              text: listOfTasks[i].text,
              time: Math.round(route.duration / 60) + ' min',
            };
            taskDescriptions.push(taskDescription);
          }

          fullSegments = [...fullSegments, ...route.segments];
        }
      } catch (error) {
        console.error(`Error generating route from task ${i} to ${i + 1}:`, error);
      }
    }
    setTaskTime(taskDescriptions);
    return {
      duration: totalDuration,
      distance: totalDistance,
      segments: fullSegments,
    };
  }
}
