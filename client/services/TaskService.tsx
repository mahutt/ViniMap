import { getRoute } from '@/modules/map/MapService';
import { calculateEuclideanDistance } from '@/modules/map/MapUtils';
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

  /**
   * Returns all permutations of an array of items.
   * @param arr - Array of items to generate permutations from
   * @returns Generator yielding all permutations of the input array
   */
  static *permutations(arr: any[]): Generator<any[]> {
    if (arr.length === 0) {
      yield [];
      return;
    }

    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
      for (const perm of TaskService.permutations(rest)) {
        yield [arr[i], ...perm];
      }
    }
  }

  static *combinations<T>(arr: T[], k: number): Generator<T[]> {
    if (k === 0) {
      yield [];
      return;
    }
    if (arr.length < k) {
      return;
    }

    const first = arr[0];
    const rest = arr.slice(1);

    for (const combo of TaskService.combinations(rest, k - 1)) {
      yield [first, ...combo];
    }

    yield* TaskService.combinations(rest, k);
  }

  /**
   * Returns all combinations of an array of items.
   * @param arr - Array of items to generate combinations from
   * @returns Generator yielding all combinations of the input array
   */
  static *allCombinations<T>(arr: T[]): Generator<T[]> {
    for (let k = 0; k <= arr.length; k++) {
      yield* TaskService.combinations(arr, k);
    }
  }

  /**
   * Reorders tasks to minimize total travel distance from a start location through all tasks to an end location.
   * This implements a nearest neighbor algorithm (a greedy approach to the Traveling Salesman Problem).
   *
   * @param tasks - Array of tasks to be reordered
   * @param startLocation - Starting location
   * @param endLocation - Final destination location
   * @returns Reordered array of tasks
   */
  static travelDistanceAwareReOrder(
    tasks: Task[],
    startLocation: Location,
    endLocation: Location
  ): { distance: number; tasks: Task[] } {
    // If no tasks or only one task, no need to reorder
    if (tasks.length <= 1) {
      return {
        distance: TaskService.calculateTotalDistance([
          startLocation,
          ...tasks.map((task) => task.location!),
          endLocation,
        ]),
        tasks: [...tasks],
      };
    }

    const remainingTasks = [...tasks];
    const result: Task[] = [];

    let currentLocation = startLocation;
    // Add tasks one by one until all tasks are included
    while (remainingTasks.length > 0) {
      let minDistance = Infinity;
      let nextTaskIndex = -1;

      for (let i = 0; i < remainingTasks.length; i++) {
        const distance = calculateEuclideanDistance(
          currentLocation.coordinates,
          remainingTasks[i].location!.coordinates
        );

        if (distance < minDistance) {
          minDistance = distance;
          nextTaskIndex = i;
        }
      }
      const nextTask = remainingTasks.splice(nextTaskIndex, 1)[0];
      result.push(nextTask);
      currentLocation = nextTask.location!;
    }

    // Check if we should swap any adjacent tasks to optimize for the final destination
    // This is an optional optimization to see if we can improve the route
    let improved = true;
    while (improved && result.length > 1) {
      improved = false;

      for (let i = 0; i < result.length - 1; i++) {
        const currentOrder = [
          ...(i === 0 ? [startLocation] : []),
          ...result.map((task) => task.location),
          endLocation,
        ];

        // Create a modified order with adjacent tasks swapped
        const swappedOrder = [...currentOrder];
        [swappedOrder[i + 1], swappedOrder[i + 2]] = [swappedOrder[i + 2], swappedOrder[i + 1]];

        // Calculate distances for both orders
        const currentDistance = TaskService.calculateTotalDistance(currentOrder as Location[]);
        const swappedDistance = TaskService.calculateTotalDistance(swappedOrder as Location[]);

        // If swapping improves the total distance, swap tasks in the result
        if (swappedDistance < currentDistance) {
          [result[i], result[i + 1]] = [result[i + 1], result[i]];
          improved = true;
          break;
        }
      }
    }

    let totalDistance = TaskService.calculateTotalDistance([
      startLocation,
      ...result.map((task) => task.location!),
      endLocation,
    ]);
    return {
      distance: totalDistance,
      tasks: result,
    };
  }

  /**
   * Helper function to calculate the total distance of a path through multiple locations
   *
   * @param locations - Array of locations in the path
   * @returns Total Euclidean distance
   */
  private static calculateTotalDistance(locations: Location[]): number {
    let totalDistance = 0;

    for (let i = 0; i < locations.length - 1; i++) {
      totalDistance += calculateEuclideanDistance(
        locations[i].coordinates,
        locations[i + 1].coordinates
      );
    }

    return totalDistance;
  }
}
