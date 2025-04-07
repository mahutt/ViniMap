import React from 'react';
import { render } from '@testing-library/react-native';
import TaskFrame from '@/components/TaskFrame';
import { TaskService } from '@/services/TaskService';

jest.mock('@/modules/map/MapContext', () => ({
  useMap: jest.fn().mockReturnValue({
    setState: jest.fn(),
    setRoute: jest.fn(),
    userLocation: { latitude: 1, longitude: 1, coordinates: [1, 1], name: 'Current Location' },
  }),
  MapState: {
    Idle: 'IDLE',
  },
}));

jest.mock('@/services/StorageService', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
  },
}));

const mockMarkTask = jest.fn();
const mockSetSelectedTasks = jest.fn();
const mockSetTasks = jest.fn();

const mockTasks = [
  {
    id: '1',
    text: 'Task 1',
    completed: false,
    data: { time: '10 min' },
    duration: 30,
    location: { coordinates: [2, 2], name: 'Location 1' },
  },
  {
    id: '2',
    text: 'Task 2',
    completed: true,
    data: { time: '20 min' },
    duration: 70,
    location: { coordinates: [3, 3], name: 'Location 2' },
  },
  {
    id: '3',
    text: 'Long task with duration',
    completed: false,
    data: { time: '30 min' },
    duration: 125,
    location: { coordinates: [4, 4], name: 'Location 3' },
  },
  {
    id: '4',
    text: 'Task without duration',
    completed: false,
    data: { time: '5 min' },
    duration: null,
    location: { coordinates: [5, 5], name: 'Location 4' },
  },
  {
    id: '5',
    text: 'Task with even hour duration',
    completed: false,
    data: { time: '15 min' },
    duration: 120,
    location: { coordinates: [6, 6], name: 'Location 5' },
  },
];

jest.mock('@/providers/TaskContext', () => {
  return {
    useTask: jest.fn().mockImplementation(() => ({
      selectedTasks: mockTasks,
      setSelectedTasks: mockSetSelectedTasks,
      markTask: mockMarkTask,
      tasks: mockTasks,
      setTasks: mockSetTasks,
    })),
  };
});

jest.mock('@/services/TaskService', () => ({
  TaskService: {
    generateTaskRoute: jest.fn().mockResolvedValue({
      route: {
        duration: 1800,
        distance: 5000,
        segments: [],
        tunnel: false,
      },
      tasks: [],
    }),
  },
}));

describe('TaskFrame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatDuration function', () => {
    interface FormatDurationProps {
      minutes: number | null;
    }

    const formatDuration = (minutes: FormatDurationProps['minutes']): string => {
      if (!minutes) return '';

      if (minutes < 60) {
        return `Duration: ${minutes} min`;
      } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0
          ? `Duration: ${hours}h ${remainingMinutes}m`
          : `Duration: ${hours}h`;
      }
    };

    it('formats durations correctly', () => {
      expect(formatDuration(null)).toBe('');
      expect(formatDuration(30)).toBe('Duration: 30 min');
      expect(formatDuration(70)).toBe('Duration: 1h 10m');
      expect(formatDuration(120)).toBe('Duration: 2h');
    });
  });

  it('renders correctly with tasks and formats durations properly', () => {
    const { getByText } = render(<TaskFrame />);

    expect(getByText('Task 1')).toBeTruthy();
    expect(getByText('Task 2')).toBeTruthy();
    expect(getByText('10 min away')).toBeTruthy();

    expect(getByText('Duration: 30 min')).toBeTruthy();
    expect(getByText('Duration: 1h 10m')).toBeTruthy();
    expect(getByText('Duration: 2h 5m')).toBeTruthy();
    expect(getByText('Duration: 2h')).toBeTruthy();
  });

  it('handles case when userLocation is not available', () => {
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);

    require('@/modules/map/MapContext').useMap.mockReturnValueOnce({
      setState: jest.fn(),
      setRoute: jest.fn(),
      userLocation: null,
    });

    const originalUseEffect = React.useEffect;
    const mockUseEffect = jest.fn().mockImplementation((fn) => originalUseEffect(fn));
    React.useEffect = mockUseEffect;

    render(<TaskFrame />);

    expect(TaskService.generateTaskRoute).not.toHaveBeenCalled();

    React.useEffect = originalUseEffect;
  });

  it('does not reload route when reloadRoute is false', () => {
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [false, jest.fn()]);

    render(<TaskFrame />);

    expect(TaskService.generateTaskRoute).not.toHaveBeenCalled();
  });

  it('handles empty tasks correctly', () => {
    // Override mock for this test
    require('@/providers/TaskContext').useTask.mockReturnValueOnce({
      selectedTasks: [],
      markTask: mockMarkTask,
      setSelectedTasks: mockSetSelectedTasks,
      tasks: [],
      setTasks: mockSetTasks,
    });

    const { getByText } = render(<TaskFrame />);

    expect(getByText('No tasks available')).toBeTruthy();
  });

  it('filters tasks with no data', () => {
    const tasksWithMissingData = [
      ...mockTasks,
      {
        id: '6',
        text: 'Task with no data',
        completed: false,
        data: undefined,
        duration: 45,
        location: { coordinates: [7, 7], name: 'Location 6' },
      },
    ];

    require('@/providers/TaskContext').useTask.mockReturnValueOnce({
      selectedTasks: tasksWithMissingData,
      markTask: mockMarkTask,
      setSelectedTasks: mockSetSelectedTasks,
      tasks: tasksWithMissingData,
      setTasks: mockSetTasks,
    });

    const { queryByText } = render(<TaskFrame />);

    expect(queryByText('Task with no data')).toBeNull();
  });
});
