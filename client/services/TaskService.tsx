import { getRoute } from '@/modules/map/MapService';
import { Route, Task, Location } from '@/types';

export class TaskService {
  static async getOptimalRouteForPaths(startLocation: Location, tasks: Task[]): Promise<Route[]> {
    // Needs to be refactored so that mapbox's api is leveraged to generate the shortest path
    const routePromises: Promise<Route>[] = [];
    const iterableTasks: Task[] = [
      {
        id: 'user-location',
        text: 'user-location',
        location: startLocation,
        startTime: new Date(),
        duration: 0,
      },
      ...tasks,
    ];
    for (let i = 0; i < iterableTasks.length - 1; i++) {
      routePromises.push(
        (async () => {
          const startLocation = iterableTasks[i].location!;
          const endLocation = iterableTasks[i + 1].location!;
          const route = await getRoute(startLocation, endLocation, 'walking');
          if (!route) {
            throw new Error(
              `Route not found between ${startLocation.name} and ${endLocation.name}`
            );
          }
          route.segments.forEach((segment) => {
            segment.taskId = iterableTasks[i + 1].id;
          });
          iterableTasks[i + 1].data = {
            time:
              route.duration >= 3600
                ? (route.duration / 3600).toFixed(2) + ' h'
                : Math.round(route.duration / 60) + ' min',
          };
          return route;
        })()
      );
    }
    return await Promise.all(routePromises);
  }
}
