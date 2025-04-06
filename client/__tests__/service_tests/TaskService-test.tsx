import { TaskService } from '@/services/TaskService';
import { Task, Location } from '@/types';

// Mocks
jest.mock('@/modules/map/MapService', () => ({
  getRoute: jest.fn(),
}));

describe('travelDistanceAwareReOrder', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the original task and distance when given an empty array', () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const endLocation: Location = { name: 'End', coordinates: [10, 10] };
    const tasks: Task[] = [];

    const result = TaskService.travelDistanceAwareReOrder(tasks, startLocation, endLocation);

    expect(result.tasks).toEqual([]);
    expect(result.distance).toBeDefined();
  });

  it('should return the original task and distance when given a single task', () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const endLocation: Location = { name: 'End', coordinates: [10, 10] };
    const tasks: Task[] = [
      {
        id: '1',
        text: 'Task 1',
        location: { name: 'Location 1', coordinates: [5, 5] },
        startTime: null,
        duration: 30,
      },
    ];

    const result = TaskService.travelDistanceAwareReOrder(tasks, startLocation, endLocation);

    expect(result.tasks).toEqual(tasks);
    expect(result.distance).toBeDefined();
  });

  it('should reorder multiple tasks based on proximity', () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const endLocation: Location = { name: 'End', coordinates: [10, 10] };
    const tasks: Task[] = [
      {
        id: '1',
        text: 'Far Task',
        location: { name: 'Location Far', coordinates: [8, 8] },
        startTime: null,
        duration: 30,
      },
      {
        id: '2',
        text: 'Near Task',
        location: { name: 'Location Near', coordinates: [1, 1] },
        startTime: null,
        duration: 30,
      },
    ];

    const result = TaskService.travelDistanceAwareReOrder(tasks, startLocation, endLocation);

    // Expecting tasks to be reordered with nearest first
    expect(result.tasks[0].id).toBe('2'); // Near task
    expect(result.tasks[1].id).toBe('1'); // Far task
    expect(result.tasks.length).toBe(2);
    expect(result.distance).toBeDefined();
  });

  it('should correctly implement the optimization logic for the final destination', () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const endLocation: Location = { name: 'End', coordinates: [10, 0] };

    // The greedy approach should not return the optimal solution given the tasks below
    const tasks: Task[] = [
      {
        id: '1',
        text: 'Task 1',
        location: { name: 'Location 1', coordinates: [2, 0] },
        startTime: null,
        duration: 30,
      },
      {
        id: '2',
        text: 'Task 2',
        location: { name: 'Location 2', coordinates: [5, 7] },
        startTime: null,
        duration: 30,
      },
      {
        id: '3',
        text: 'Task 3',
        location: { name: 'Location 3', coordinates: [8, 0] },
        startTime: null,
        duration: 30,
      },
    ];

    const result = TaskService.travelDistanceAwareReOrder(tasks, startLocation, endLocation);
    expect(result.distance).toBeCloseTo(19.23, 2);
  });

  it('should not swap tasks when no improvement is possible', () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const endLocation: Location = { name: 'End', coordinates: [10, 0] };

    const tasks: Task[] = [
      {
        id: '1',
        text: 'Task 1',
        location: { name: 'Location 1', coordinates: [2, 0] },
        startTime: null,
        duration: 30,
      },
      {
        id: '2',
        text: 'Task 2',
        location: { name: 'Location 2', coordinates: [5, 0] },
        startTime: null,
        duration: 30,
      },
    ];

    const originalTaskIds = tasks.map((task) => task.id);
    const result = TaskService.travelDistanceAwareReOrder(tasks, startLocation, endLocation);
    expect(result.tasks.map((task) => task.id)).toEqual(originalTaskIds);
  });
});
