import { TaskService } from '@/services/TaskService';
import { Task, Location, Route } from '@/types';

jest.mock('@/modules/map/MapService', () => ({
  getRoute: jest.fn(
    (startLocation: Location, endLocation: Location, _: string): Promise<Route | null> => {
      const WALK_SPEED = 1;

      const distance = Math.sqrt(
        Math.pow(endLocation.coordinates[0] - startLocation.coordinates[0], 2) +
          Math.pow(endLocation.coordinates[1] - startLocation.coordinates[1], 2)
      );

      return Promise.resolve({
        duration: Math.round(distance / WALK_SPEED),
        distance: distance,
        segments: [
          {
            id: '1',
            type: 'dashed',
            steps: [startLocation.coordinates, endLocation.coordinates],
          },
        ],
        tunnel: false,
      });
    }
  ),
}));

jest.mock('@/services/gptService', () => ({
  generateMissingDurations: jest.fn().mockReturnValue(Promise.resolve()),
  generateMissingLocations: jest.fn().mockReturnValue(Promise.resolve()),
}));

describe('generateTaskRoute', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // F1 (Base Case)
  it('should return a route with duration and distance', async () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const selectedTasks: Task[] = [
      {
        id: 'c1',
        text: 'task',
        location: { name: 'location', coordinates: [5, 0] },
        startTime: new Date('2023-10-01T10:00:00Z'),
        duration: 1,
      },
      {
        id: 'c2',
        text: 'task',
        location: { name: 'location', coordinates: [10, 0] },
        startTime: new Date('2023-10-01T10:10:00Z'),
        duration: 2,
      },
      {
        id: 'c3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 10] },
        startTime: new Date('2023-10-01T11:00:00Z'),
        duration: 3,
      },
      {
        id: 'f1',
        text: 'task',
        location: { name: 'location', coordinates: [7, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f2',
        text: 'task',
        location: { name: 'location', coordinates: [6, 1] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 5] },
        startTime: null,
        duration: 10,
      },
    ];
    const result = await TaskService.generateTaskRoute(startLocation, [...selectedTasks]);
    expect(result.tasks.map((task) => task.id)).toEqual(['c1', 'f2', 'f1', 'c2', 'f3', 'c3']);
  });

  // F2
  it('throws an error when a null startLocation is passed', async () => {
    const startLocation: Location = null as unknown as Location;
    const selectedTasks: Task[] = [
      {
        id: 'c1',
        text: 'task',
        location: { name: 'location', coordinates: [5, 0] },
        startTime: new Date('2023-10-01T10:00:00Z'),
        duration: 1,
      },
      {
        id: 'c2',
        text: 'task',
        location: { name: 'location', coordinates: [10, 0] },
        startTime: new Date('2023-10-01T10:10:00Z'),
        duration: 2,
      },
      {
        id: 'c3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 10] },
        startTime: new Date('2023-10-01T11:00:00Z'),
        duration: 3,
      },
      {
        id: 'f1',
        text: 'task',
        location: { name: 'location', coordinates: [7, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f2',
        text: 'task',
        location: { name: 'location', coordinates: [6, 1] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 5] },
        startTime: null,
        duration: 10,
      },
    ];
    await expect(TaskService.generateTaskRoute(startLocation, [...selectedTasks])).rejects.toThrow(
      `Cannot read properties of null (reading 'coordinates')`
    );
  });

  // F3
  it('gracefully handles 0 core tasks', async () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const selectedTasks: Task[] = [
      {
        id: 'f1',
        text: 'task',
        location: { name: 'location', coordinates: [7, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f2',
        text: 'task',
        location: { name: 'location', coordinates: [6, 1] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 5] },
        startTime: null,
        duration: 10,
      },
    ];
    const result = await TaskService.generateTaskRoute(startLocation, [...selectedTasks]);
    expect(result.tasks.map((task) => task.id)).toEqual(['f1', 'f2', 'f3']);
  });

  // F4
  it('gracefully handles 1 core task', async () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const selectedTasks: Task[] = [
      {
        id: 'c1',
        text: 'task',
        location: { name: 'location', coordinates: [5, 0] },
        startTime: new Date('2023-10-01T10:00:00Z'),
        duration: 1,
      },
      {
        id: 'f1',
        text: 'task',
        location: { name: 'location', coordinates: [7, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f2',
        text: 'task',
        location: { name: 'location', coordinates: [6, 1] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 5] },
        startTime: null,
        duration: 10,
      },
    ];
    const result = await TaskService.generateTaskRoute(startLocation, [...selectedTasks]);
    expect(result.tasks.map((task) => task.id)).toEqual(['c1', 'f1', 'f2', 'f3']);
  });

  // F5
  it('Gracefully handles 5 core tasks', async () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const selectedTasks: Task[] = [
      {
        id: 'c1',
        text: 'task',
        location: { name: 'location', coordinates: [5, 0] },
        startTime: new Date('2023-10-01T10:00:00Z'),
        duration: 1,
      },
      {
        id: 'c2',
        text: 'task',
        location: { name: 'location', coordinates: [10, 0] },
        startTime: new Date('2023-10-01T10:10:00Z'),
        duration: 2,
      },
      {
        id: 'c3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 10] },
        startTime: new Date('2023-10-01T11:00:00Z'),
        duration: 3,
      },
      {
        id: 'f1',
        text: 'task',
        location: { name: 'location', coordinates: [7, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f2',
        text: 'task',
        location: { name: 'location', coordinates: [6, 1] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 5] },
        startTime: null,
        duration: 10,
      },
      {
        id: 'c4',
        text: 'task',
        location: { name: 'location', coordinates: [15, 10] },
        startTime: new Date('2023-10-01T12:00:00Z'),
        duration: 3,
      },
      {
        id: 'c5',
        text: 'task',
        location: { name: 'location', coordinates: [10, 12] },
        startTime: new Date('2023-10-01T12:10:00Z'),
        duration: 3,
      },
      {
        id: 'c6',
        text: 'task',
        location: { name: 'location', coordinates: [7, 12] },
        startTime: new Date('2023-10-01T12:20:00Z'),
        duration: 3,
      },
    ];
    const result = await TaskService.generateTaskRoute(startLocation, [...selectedTasks]);
    expect(result.tasks.map((task) => task.id)).toEqual([
      'c1',
      'c2',
      'c3',
      'f2',
      'f1',
      'f3',
      'c4',
      'c5',
      'c6',
    ]);
  });

  // F6
  it('Gracefully handles routes with 0 filler tasks', async () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const selectedTasks: Task[] = [
      {
        id: 'c1',
        text: 'task',
        location: { name: 'location', coordinates: [5, 0] },
        startTime: new Date('2023-10-01T10:00:00Z'),
        duration: 1,
      },
      {
        id: 'c2',
        text: 'task',
        location: { name: 'location', coordinates: [10, 0] },
        startTime: new Date('2023-10-01T10:10:00Z'),
        duration: 2,
      },
      {
        id: 'c3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 10] },
        startTime: new Date('2023-10-01T11:00:00Z'),
        duration: 3,
      },
      {
        id: 'c4',
        text: 'task',
        location: { name: 'location', coordinates: [15, 10] },
        startTime: new Date('2023-10-01T12:00:00Z'),
        duration: 3,
      },
      {
        id: 'c5',
        text: 'task',
        location: { name: 'location', coordinates: [10, 12] },
        startTime: new Date('2023-10-01T12:10:00Z'),
        duration: 3,
      },
    ];
    const result = await TaskService.generateTaskRoute(startLocation, [...selectedTasks]);
    expect(result.tasks.map((task) => task.id)).toEqual(['c1', 'c2', 'c3', 'c4', 'c5']);
  });

  // F7
  it('gracefully handles 1 filler task', async () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const selectedTasks: Task[] = [
      {
        id: 'c1',
        text: 'task',
        location: { name: 'location', coordinates: [5, 0] },
        startTime: new Date('2023-10-01T10:00:00Z'),
        duration: 1,
      },
      {
        id: 'c2',
        text: 'task',
        location: { name: 'location', coordinates: [10, 0] },
        startTime: new Date('2023-10-01T10:10:00Z'),
        duration: 2,
      },
      {
        id: 'c3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 10] },
        startTime: new Date('2023-10-01T11:00:00Z'),
        duration: 3,
      },
      {
        id: 'f1',
        text: 'task',
        location: { name: 'location', coordinates: [7, 0] },
        startTime: null,
        duration: 1,
      },
    ];
    const result = await TaskService.generateTaskRoute(startLocation, [...selectedTasks]);
    expect(result.tasks.map((task) => task.id)).toEqual(['c1', 'f1', 'c2', 'c3']);
  });

  // F8
  it('gracefully handles more than 5 filler tasks', async () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const selectedTasks: Task[] = [
      {
        id: 'c1',
        text: 'task',
        location: { name: 'location', coordinates: [5, 0] },
        startTime: new Date('2023-10-01T10:00:00Z'),
        duration: 1,
      },
      {
        id: 'c2',
        text: 'task',
        location: { name: 'location', coordinates: [10, 0] },
        startTime: new Date('2023-10-01T10:10:00Z'),
        duration: 2,
      },
      {
        id: 'c3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 10] },
        startTime: new Date('2023-10-01T11:00:00Z'),
        duration: 3,
      },
      {
        id: 'f1',
        text: 'task',
        location: { name: 'location', coordinates: [7, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f2',
        text: 'task',
        location: { name: 'location', coordinates: [6, 1] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 5] },
        startTime: null,
        duration: 10,
      },
      {
        id: 'f4',
        text: 'task',
        location: { name: 'location', coordinates: [1, 8] },
        startTime: null,
        duration: 60,
      },
      {
        id: 'f5',
        text: 'task',
        location: { name: 'location', coordinates: [1, 7] },
        startTime: null,
        duration: 60,
      },
      {
        id: 'f6',
        text: 'task',
        location: { name: 'location', coordinates: [1, 6] },
        startTime: null,
        duration: 60,
      },
    ];
    const result = await TaskService.generateTaskRoute(startLocation, [...selectedTasks]);
    expect(result.tasks.map((task) => task.id)).toEqual([
      'c1',
      'f2',
      'f1',
      'c2',
      'f3',
      'c3',
      'f4',
      'f5',
      'f6',
    ]);
  });

  // F9
  it('it should correctly handle 0 filler tasks between core tasks', async () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const selectedTasks: Task[] = [
      {
        id: 'c1',
        text: 'task',
        location: { name: 'location', coordinates: [5, 0] },
        startTime: new Date('2023-10-01T10:00:00Z'),
        duration: 1,
      },
      {
        id: 'c2',
        text: 'task',
        location: { name: 'location', coordinates: [15, 0] },
        startTime: new Date('2023-10-01T10:30:00Z'),
        duration: 2,
      },
      {
        id: 'c3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 10] },
        startTime: new Date('2023-10-01T11:00:00Z'),
        duration: 3,
      },
    ];
    const result = await TaskService.generateTaskRoute(startLocation, [...selectedTasks]);
    expect(result.tasks.map((task) => task.id)).toEqual(['c1', 'c2', 'c3']);
  });

  // F10
  it('it should handle 1 filler task between core tasks', async () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const selectedTasks: Task[] = [
      {
        id: 'c1',
        text: 'task',
        location: { name: 'location', coordinates: [5, 0] },
        startTime: new Date('2023-10-01T10:00:00Z'),
        duration: 1,
      },
      {
        id: 'c2',
        text: 'task',
        location: { name: 'location', coordinates: [15, 0] },
        startTime: new Date('2023-10-01T10:30:00Z'),
        duration: 2,
      },
      {
        id: 'c3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 10] },
        startTime: new Date('2023-10-01T11:00:00Z'),
        duration: 3,
      },
      {
        id: 'f1',
        text: 'task',
        location: { name: 'location', coordinates: [10, 0] },
        startTime: null,
        duration: 1,
      },
    ];
    const result = await TaskService.generateTaskRoute(startLocation, [...selectedTasks]);
    expect(result.tasks.map((task) => task.id)).toEqual(['c1', 'f1', 'c2', 'c3']);
  });

  // F11
  it('it should correctly handle more than 5 filler tasks between core tasks', async () => {
    const startLocation: Location = { name: 'Start', coordinates: [0, 0] };
    const selectedTasks: Task[] = [
      {
        id: 'c1',
        text: 'task',
        location: { name: 'location', coordinates: [5, 0] },
        startTime: new Date('2023-10-01T10:00:00Z'),
        duration: 1,
      },
      {
        id: 'c2',
        text: 'task',
        location: { name: 'location', coordinates: [50, 0] },
        startTime: new Date('2023-10-01T14:00:00Z'),
        duration: 2,
      },
      {
        id: 'c3',
        text: 'task',
        location: { name: 'location', coordinates: [10, 10] },
        startTime: new Date('2023-10-01T15:00:00Z'),
        duration: 3,
      },
      {
        id: 'f1',
        text: 'task',
        location: { name: 'location', coordinates: [10, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f2',
        text: 'task',
        location: { name: 'location', coordinates: [15, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f3',
        text: 'task',
        location: { name: 'location', coordinates: [20, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f4',
        text: 'task',
        location: { name: 'location', coordinates: [25, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f5',
        text: 'task',
        location: { name: 'location', coordinates: [30, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f6',
        text: 'task',
        location: { name: 'location', coordinates: [35, 0] },
        startTime: null,
        duration: 1,
      },
      {
        id: 'f7',
        text: 'task',
        location: { name: 'location', coordinates: [40, 0] },
        startTime: null,
        duration: 1,
      },
    ];
    const result = await TaskService.generateTaskRoute(startLocation, [...selectedTasks]);
    expect(result.tasks.map((task) => task.id)).toEqual([
      'c1',
      'f1',
      'f2',
      'f3',
      'f4',
      'f5',
      'f6',
      'f7',
      'c2',
      'c3',
    ]);
  });
});

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
