import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { TaskProvider } from '@/providers/TaskContext';
import TasksScreen from '@/app/(tabs)/tasks';

jest.mock('@/modules/map/MapService', () => ({
  getLocations: jest.fn(() => Promise.resolve([{ name: 'Mock Location', coordinates: [0, 0] }])),
}));

const renderComponent = () =>
  render(
    <TaskProvider>
      <TasksScreen />
    </TaskProvider>
  );

describe('TasksScreen', () => {
  it('matches the snapshot', () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays "No tasks yet." when there are no tasks', () => {
    renderComponent();
    expect(screen.getByText('No tasks yet.')).toBeTruthy();
  });

  it('opens the modal when the plus button is clicked', async () => {
    renderComponent();

    fireEvent.press(screen.getByText('+'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Task name')).toBeVisible();
      expect(screen.getByPlaceholderText('Location')).toBeVisible();
    });
  });

  it('undos the last task change', async () => {
    renderComponent();

    fireEvent.press(screen.getByText('+'));
    fireEvent.changeText(screen.getByPlaceholderText('Task name'), 'Undo Task');
    fireEvent.changeText(screen.getByPlaceholderText('Location'), 'Undo Location');

    const addTaskButtons = screen.getAllByText('Add Task');
    fireEvent.press(addTaskButtons[addTaskButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Undo Task')).toBeTruthy();
    });

    // Undo the change
    fireEvent.press(screen.getByTestId('undo-button'));

    await waitFor(() => {
      expect(screen.queryByText('Undo Task')).toBeFalsy();
    });
  });

  it('allows users to add a task', async () => {
    renderComponent();

    fireEvent.press(screen.getByText('+'));

    fireEvent.changeText(screen.getByPlaceholderText('Task name'), 'Test Task');
    fireEvent.changeText(screen.getByPlaceholderText('Location'), 'Test Location');

    const addTaskButtons = screen.getAllByText('Add Task');
    fireEvent.press(addTaskButtons[addTaskButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeTruthy();
    });
  });
});
