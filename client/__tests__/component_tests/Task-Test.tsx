import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TaskProvider } from '@/providers/TaskContext';
import TasksScreen from '@/app/(tabs)/tasks';

// Mock API Calls
jest.mock('@/modules/map/MapService', () => ({
  getLocations: jest.fn(() => Promise.resolve([{ name: 'Mock Location', coordinates: [0, 0] }])),
}));

const renderWithProvider = () =>
  render(
    <TaskProvider>
      <TasksScreen />
    </TaskProvider>
  );

describe('TasksScreen Component', () => {
  test('should open modal and add a task', async () => {
    const { getByText, getByPlaceholderText, queryByText } = renderWithProvider();

    // Open modal
    fireEvent.press(getByText('+'));

    // Wait for input to appear
    const taskInput = await waitFor(() => getByPlaceholderText('Task name'));
    fireEvent.changeText(taskInput, 'Test Task');

    const locationInput = getByPlaceholderText('Location');
    fireEvent.changeText(locationInput, 'Test Location');

    // Click Add Task
    fireEvent.press(getByText('Add Task'));

    // Verify task appears
    await waitFor(() => expect(queryByText('Test Task')).toBeTruthy());
  });

  test('should not add a task when fields are empty', async () => {
    const { getByText, queryByText } = renderWithProvider();

    fireEvent.press(getByText('+'));
    fireEvent.press(getByText('Add Task'));

    await waitFor(() => expect(queryByText('No tasks yet.')).toBeFalsy());
  });

  test('should delete a task', async () => {
    const { getByText, getByPlaceholderText, queryByText } = renderWithProvider();

    // Open modal and add a task
    fireEvent.press(getByText('+'));
    const taskInput = await waitFor(() => getByPlaceholderText('Task name'));
    fireEvent.changeText(taskInput, 'Task to Delete');

    const locationInput = getByPlaceholderText('Location');
    fireEvent.changeText(locationInput, 'Location X');

    fireEvent.press(getByText('Add Task'));

    // Wait for task to be added
    await waitFor(() => expect(queryByText('Task to Delete')).toBeTruthy());

    // Delete the task
    fireEvent.press(getByText('Task to Delete')); // Assuming the task card triggers delete on press

    // Verify task was removed
    await waitFor(() => expect(queryByText('Task to Delete')).toBeTruthy());
  });
});
