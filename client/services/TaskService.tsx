import { getRoute } from '@/modules/map/MapService';
import { calculateEuclideanDistance } from '@/modules/map/MapUtils';
import { Route, Task, Location } from '@/types';
import { generateMissingDurations, generateMissingLocations } from './gptService';

export class TaskService {
  static async generateTaskRoute(
    startLocation: Location,
    tasks: Task[]
  ): Promise<{
    route: Route;
    tasks: Task[];
  }> {
    const generateDurationsPromise = generateMissingDurations(tasks);
    const generateLocationsPromise = generateMissingLocations(tasks, [
      startLocation.coordinates[0],
      startLocation.coordinates[1],
    ]);

    // Generating missing durations and locations for all tasks
    await Promise.all([generateDurationsPromise, generateLocationsPromise]);

    // Core tasks have a start time and a location - tasks with a set time
    // and with no location at this point are implicitly discarded
    const coreTaskCandidates = tasks.filter((task) => task.startTime !== null);
    let fillerTasks = tasks.filter((task) => task.startTime === null && task.location !== null);
    let coreTasks = coreTaskCandidates
      .filter((task) => task.location !== null)
      .sort((a, b) => {
        const aHour = a.startTime?.getHours() ?? 0;
        const bHour = b.startTime?.getHours() ?? 0;
        return aHour - bHour;
      });

    let partialRoutes = await TaskService.getOptimalRouteForPaths(startLocation, coreTasks);

    // START FILLING IN FILLER TASKS
    const updatedPartialRoutes: Route[] = [];
    const updatedCoreTasks: Task[] = [];
    const usedFillerTaskIds = new Set<string>();
    fillerTasks = fillerTasks.filter((task) => task.location !== null); // drop filler tasks with no location
    for (let i = 0; i < partialRoutes.length; i++) {
      const startTask =
        i === 0
          ? { duration: 0, startTime: new Date(), location: startLocation }
          : coreTasks[i - 1];
      const endTask = coreTasks[i];
      const route = partialRoutes[i];

      const maximumFreeTime =
        (endTask.startTime?.getTime() ?? 0) -
        ((startTask.startTime?.getTime() ?? 0) + (startTask.duration ?? 0) * 60 * 1000) -
        route.duration * 1000;

      // Obtain all combinations of filler tasks that fit within the maximum free time
      const unusedFillerTasks = fillerTasks.filter((task) => !usedFillerTaskIds.has(task.id));
      const feasibleFillerTaskCombinations: Task[][] = [];
      for (const taskCombination of TaskService.allCombinations<Task>(unusedFillerTasks)) {
        if (taskCombination.length === 0) continue;
        const totalDuration = taskCombination.reduce((acc, task) => acc + (task.duration ?? 0), 0);
        if (totalDuration * 60 * 1000 <= maximumFreeTime) {
          feasibleFillerTaskCombinations.push(taskCombination);
        }
      }

      // Order each combination to minimize travel distance
      const orderedFillerTaskCombinations: { distance: number; tasks: Task[] }[] =
        feasibleFillerTaskCombinations.map((combination) =>
          TaskService.travelDistanceAwareReOrder(
            combination,
            startTask.location!,
            endTask.location!
          )
        );

      // Order the combinations themselves by task count (decreasing) and travel distance (increasing)
      const orderedFillerTaskCombinationsSorted = TaskService.orderTaskCombinations(
        orderedFillerTaskCombinations
      );

      let routeWasUpdated = false;
      for (const permutation of orderedFillerTaskCombinationsSorted) {
        const permutationRoutes = await TaskService.getOptimalRouteForPaths(startTask.location!, [
          ...permutation.tasks,
          endTask,
        ]);

        // Units: seconds
        const permutationRouteDuration = permutationRoutes.reduce(
          (acc, route) => acc + route.duration,
          0
        );

        // Units: Minutes
        const permutationTasksDuration = permutation.tasks.reduce(
          (acc, task) => acc + (task.duration ?? 0),
          0
        );
        const totalDurationSeconds = permutationRouteDuration + permutationTasksDuration * 60;
        if (totalDurationSeconds * 1000 <= maximumFreeTime && permutationRoutes.length > 0) {
          // Add permutationRoutes to the updated partialRoutes
          updatedPartialRoutes.push(...permutationRoutes);
          updatedCoreTasks.push(...permutation.tasks, endTask);
          routeWasUpdated = true;

          // Mark the tasks as used
          for (const task of permutation.tasks) {
            usedFillerTaskIds.add(task.id);
          }

          break;
        }
      }
      // Don't squeeze in any filler tasks:
      if (!routeWasUpdated) {
        updatedPartialRoutes.push(route);
        updatedCoreTasks.push(endTask);
      }
    }
    partialRoutes = updatedPartialRoutes;
    coreTasks = updatedCoreTasks;
    // END FILLING IN FILLER TASKS

    // START USE REST OF FILLER TASKS
    const remainingFillerTasks = fillerTasks.filter((task) => !usedFillerTaskIds.has(task.id));
    if (remainingFillerTasks.length > 0) {
      const fromLocation =
        coreTasks.length > 0 ? coreTasks[coreTasks.length - 1].location! : startLocation;
      const remainingRoute = await TaskService.getOptimalRouteForPaths(
        fromLocation,
        remainingFillerTasks
      );
      partialRoutes.push(...remainingRoute);
      coreTasks.push(...remainingFillerTasks);
    }
    // END USE REST OF FILLER TASKS

    const useTunnel = partialRoutes.some((route) => route.tunnel);
    const totalDuration = partialRoutes.reduce((acc, route) => acc + route.duration, 0);
    const totalDistance = partialRoutes.reduce((acc, route) => acc + route.distance, 0);
    const segments = partialRoutes.flatMap((route) => route.segments);
    for (let i = 0; i < segments.length; i++) {
      segments[i].id = ('segment-' + i).toString();
    }
    const taskRoute: Route = {
      duration: totalDuration,
      distance: totalDistance,
      segments: segments,
      tunnel: useTunnel,
    };

    return {
      route: taskRoute,
      tasks: coreTasks,
    };
  }

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

    TaskService.optimizeReOrder(result, startLocation, endLocation);

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

  private static optimizeReOrder(tasks: Task[], startLocation: Location, endLocation: Location) {
    // Check if we should swap any adjacent tasks to optimize for the final destination
    // This is an optional optimization to see if we can improve the route
    let improved = true;
    while (improved && tasks.length > 1) {
      improved = false;

      for (let i = 0; i < tasks.length - 1; i++) {
        const currentOrder = [
          ...(i === 0 ? [startLocation] : []),
          ...tasks.map((task) => task.location),
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
          [tasks[i], tasks[i + 1]] = [tasks[i + 1], tasks[i]];
          improved = true;
          break;
        }
      }
    }
  }

  /**
   * Helper function to calculate the total distance of a path through multiple locations
   *
   * @param locations - Array of locations in the path
   * @returns Total Euclidean distance
   */
  static calculateTotalDistance(locations: Location[]): number {
    let totalDistance = 0;

    for (let i = 0; i < locations.length - 1; i++) {
      totalDistance += calculateEuclideanDistance(
        locations[i].coordinates,
        locations[i + 1].coordinates
      );
    }

    return totalDistance;
  }

  /**
   * Helper function to order task combinations based on task count and distance
   * @param combinations - Array of combinations to be ordered
   * @returns Ordered array of combinations based on task count and distance
   */
  private static orderTaskCombinations(combinations: { distance: number; tasks: Task[] }[]) {
    const combinationsCopy = [...combinations];
    combinationsCopy.sort((a, b) => {
      const taskCountDiff = b.tasks.length - a.tasks.length; // descending
      if (taskCountDiff === 0) {
        return a.distance - b.distance; // ascending
      }
      return taskCountDiff;
    });
    return combinationsCopy;
  }
}
