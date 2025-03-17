import React from 'react';
import { render } from '@testing-library/react-native';
import TaskCard from '@/components/TaskCard';

test('renders TaskCard correctly', () => {
  const { toJSON } = render(
    <TaskCard text="Test Task" selected={false} onDelete={() => {}} onSelect={() => {}} />
  );

  expect(toJSON()).toMatchSnapshot();
});
