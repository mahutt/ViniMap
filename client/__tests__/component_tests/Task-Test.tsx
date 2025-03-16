import React from 'react';
import { render } from '@testing-library/react-native';
import TasksScreen from '@/app/(tabs)/tasks';

// Mock dependencies
jest.mock('@/components/TaskCard', () => 'TaskCard');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

describe('TasksScreen Component', () => {
  it('matches snapshot when there are no tasks', () => {
    const { toJSON } = render(<TasksScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot when there are tasks', () => {
    jest.spyOn(React, 'useState').mockReturnValueOnce([
      [
        { id: '1', text: 'Task 1', coordinates: [0, 0] },
        { id: '2', text: 'Task 2', coordinates: [0, 0] },
      ],
      jest.fn(),
    ]);

    const { toJSON } = render(<TasksScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
