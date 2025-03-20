import { getRoute } from '@/modules/map/MapService';
import { Route, Task } from '@/modules/map/Types';

class TaskService {
  static async getOptimalRouteForPaths(listOfTasks: Task[]) {
    if (listOfTasks.length < 2) {
      throw new Error('At least two tasks are required to calculate a route.');
    }

    let fullRouteCoordinates: any[] = [];

    for (let i = 0; i < listOfTasks.length - 1; i++) {
      const startCoordinates = listOfTasks[i].location;
      const endCoordinates = listOfTasks[i + 1].location;

      const route = await getRoute(startCoordinates, endCoordinates, 'walking');

      console.log(route);
    }

    return fullRouteCoordinates;
  }
}
