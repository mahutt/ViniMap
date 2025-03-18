import { renderHook, act } from '@testing-library/react-native';
import { Task } from '@/modules/map/Types';
import { TaskProvider, useTask } from '@/providers/TaskContext';

describe('TaskProvider', () => {
  it('initially has an empty task list', () => {
    const { result } = renderHook(() => useTask(), { wrapper: TaskProvider });
    expect(result.current.selectedTasks).toEqual([]);
  });

  it('updates the task list', () => {
    const { result } = renderHook(() => useTask(), { wrapper: TaskProvider });

    const newTask: Task = { id: '1', text: 'Buy groceries', coordinates: [0, 0] };

    act(() => {
      result.current.setSelectedTasks([newTask]);
    });

    expect(result.current.selectedTasks).toEqual([newTask]);
  });

  it('throws an error when used outside TaskProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useTask();
      } catch (error) {
        return error;
      }
    });

    expect(result.current.message).toBe('useTask must be used within a TaskProvider');
  });
});
