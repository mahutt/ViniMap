import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TaskProvider } from '@/providers/TaskContext';
import TasksScreen from '@/app/(tabs)/tasks';

jest.mock('@/modules/map/MapService', () => ({
  getLocations: jest.fn(() => Promise.resolve([{ name: 'Mock Location', coordinates: [0, 0] }])),
}));

describe('TasksScreen', () => {
  it('matches the snapshot', () => {
    const { toJSON } = render(
      <TaskProvider>
        <TasksScreen />
      </TaskProvider>
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('displays "No tasks yet." when there are no tasks', () => {
    const { getByText } = render(
      <TaskProvider>
        <TasksScreen />
      </TaskProvider>
    );

    expect(getByText('No tasks yet.')).toBeTruthy();
  });

  it('opens the modal when the plus button is clicked', () => {
    const { getByText, getByPlaceholderText } = render(
      <TaskProvider>
        <TasksScreen />
      </TaskProvider>
    );

    fireEvent.press(getByText('+'));

    expect(getByPlaceholderText('Task name')).toBeTruthy();
    expect(getByPlaceholderText('Location')).toBeTruthy();
  });
  it('allows users to add a task', async () => {
    const { getByText, getByPlaceholderText, getAllByText, queryByText } = render(
      <TaskProvider>
        <TasksScreen />
      </TaskProvider>
    );

    // Open modal
    fireEvent.press(getByText('+'));

    const taskInput = getByPlaceholderText('Task name');
    const locationInput = getByPlaceholderText('Location');

    fireEvent.changeText(taskInput, 'Test Task');
    fireEvent.changeText(locationInput, 'Test Location');

    // Find the correct 'Add Task' button inside the modal
    const addTaskButtons = getAllByText('Add Task');
    fireEvent.press(addTaskButtons[addTaskButtons.length - 1]); // Press the last 'Add Task' button

    await waitFor(() => expect(queryByText('Test Task')).toBeTruthy());
  });
});
