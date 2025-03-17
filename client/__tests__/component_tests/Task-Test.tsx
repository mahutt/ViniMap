import React from 'react';
import { render } from '@testing-library/react-native';
import { TaskProvider } from '@/providers/TodoListContext'; // Import TaskProvider
import TasksScreen from '@/app/(tabs)/tasks';

test('renders TasksScreen correctly', () => {
  const { toJSON } = render(
    <TaskProvider>
      {' '}
      {}
      <TasksScreen />
    </TaskProvider>
  );

  expect(toJSON()).toMatchSnapshot();
});

test('displays "No tasks yet" when task list is empty', () => {
  const { getByText } = render(
    <TaskProvider>
      <TasksScreen />
    </TaskProvider>
  );

  expect(getByText('No tasks yet.')).toBeTruthy();
});
test('renders the add task button', () => {
  const { getByText } = render(
    <TaskProvider>
      <TasksScreen />
    </TaskProvider>
  );

  expect(getByText('+')).toBeTruthy(); // Checking for the "+" button
});

test('renders the generate path button', () => {
  const { getByText } = render(
    <TaskProvider>
      <TasksScreen />
    </TaskProvider>
  );

  expect(getByText('Generate Path')).toBeTruthy();
});
