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
});
