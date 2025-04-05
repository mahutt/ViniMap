import { TaskService } from '@/services/TaskService';
import { getRoute } from '@/modules/map/MapService';
import { Task } from '@/types';
import uuid from 'react-native-uuid';

// Mocks
jest.mock('@/modules/map/MapService', () => ({
  getRoute: jest.fn(),
}));

jest.mock('react-native-uuid', () => ({
  v4: jest.fn(),
}));

describe('TaskService', () => {
  const mockSetTaskTime = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOptimalRouteForPaths', () => {
    it('should throw an error when no tasks are provided', async () => {
      await expect(
        TaskService.getOptimalRouteForPaths(
          {
            name: 'Task 1',
            coordinates: [1, 1],
          },
          []
        )
      ).rejects.toThrow('No tasks are selected');
      expect(mockSetTaskTime).not.toHaveBeenCalled();
    });

    it('should return a route with expected properties when tasks are provided', async () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          location: { name: 'Task 1', coordinates: [1, 1] },
          text: 'Task 1',
          startTime: null,
          duration: null,
        },
        {
          id: 'task-2',
          location: { name: 'Task 2', coordinates: [2, 2] },
          text: 'Task 2',
          startTime: null,
          duration: null,
        },
        {
          id: 'task-3',
          location: { name: 'Task 3', coordinates: [3, 3] },
          text: 'Task 3',
          startTime: null,
          duration: null,
        },
      ];

      const mockRoute1 = {
        distance: 100,
        duration: 300,
        segments: [{ id: 'segment1' }],
      };

      const mockRoute2 = {
        distance: 200,
        duration: 600,
        segments: [{ id: 'segment2' }],
      };

      // Mock UUIDs
      (uuid.v4 as jest.Mock).mockReturnValueOnce('uuid-task-2').mockReturnValueOnce('uuid-task-3');

      (getRoute as jest.Mock).mockImplementation((start, end) => {
        if (
          JSON.stringify(start.coordinates) === JSON.stringify([1, 1]) &&
          JSON.stringify(end.coordinates) === JSON.stringify([2, 2])
        ) {
          return Promise.resolve(mockRoute1);
        } else if (
          JSON.stringify(start.coordinates) === JSON.stringify([2, 2]) &&
          JSON.stringify(end.coordinates) === JSON.stringify([3, 3])
        ) {
          return Promise.resolve(mockRoute2);
        }
        return Promise.reject(new Error('Unexpected route'));
      });

      const result = await TaskService.getOptimalRouteForPaths(
        { name: 'Task 1', coordinates: [1, 1] },
        tasks
      );

      expect(result).toEqual({
        distance: 300,
        duration: 900,
        segments: [{ id: 'segment1' }, { id: 'segment2' }],
      });

      expect(mockSetTaskTime).toHaveBeenCalledWith([
        { id: 'uuid-task-2', text: 'Task 2', time: '5 min' },
        { id: 'uuid-task-3', text: 'Task 3', time: '10 min' },
      ]);
    });

    it('should handle route time formatting correctly for durations >= 1 hour', async () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          location: { name: 'Task 1', coordinates: [1, 1] },
          text: 'Task 1',
          startTime: null,
          duration: null,
        },
        {
          id: 'task-2',
          location: { name: 'Task 2', coordinates: [2, 2] },
          text: 'Task 2',
          startTime: null,
          duration: null,
        },
      ];

      const mockRoute = {
        distance: 1000,
        duration: 3600 * 2.5,
        segments: [{ id: 'longSegment' }],
      };

      (uuid.v4 as jest.Mock).mockReturnValueOnce('uuid-task-2');

      (getRoute as jest.Mock).mockResolvedValue(mockRoute);

      await TaskService.getOptimalRouteForPaths({ name: 'Task 1', coordinates: [1, 1] }, tasks);

      expect(mockSetTaskTime).toHaveBeenCalledWith([
        { id: 'uuid-task-2', text: 'Task 2', time: '2.50 h' },
      ]);
    });

    it('should handle errors when getting routes and continue processing', async () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          location: { name: 'Task 1', coordinates: [1, 1] },
          text: 'Task 1',
          startTime: null,
          duration: null,
        },
        {
          id: 'task-2',
          location: { name: 'Task 2', coordinates: [2, 2] },
          text: 'Task 2',
          startTime: null,
          duration: null,
        },
        {
          id: 'task-3',
          location: { name: 'Task 3', coordinates: [3, 3] },
          text: 'Task 3',
          startTime: null,
          duration: null,
        },
      ];

      (uuid.v4 as jest.Mock).mockReturnValueOnce('uuid-task-2');

      (getRoute as jest.Mock)
        .mockResolvedValueOnce({
          distance: 100,
          duration: 300,
          segments: [{ id: 'segment1' }],
        })
        .mockRejectedValueOnce(new Error('Route calculation failed'));

      jest.spyOn(console, 'error').mockImplementation();

      const result = await TaskService.getOptimalRouteForPaths(
        {
          name: 'Task 1',
          coordinates: [1, 1],
        },
        tasks
      );

      expect(console.error).toHaveBeenCalledWith(
        'Error generating route from task 1 to 2:',
        expect.any(Error)
      );

      expect(result).toEqual({
        distance: 100,
        duration: 300,
        segments: [{ id: 'segment1' }],
      });

      expect(mockSetTaskTime).toHaveBeenCalledWith([
        { id: 'uuid-task-2', text: 'Task 2', time: '5 min' },
      ]);
    });
  });
});
