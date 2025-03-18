import React from 'react';
import { render } from '@testing-library/react-native';
import TaskCard from '@/components/TaskCard';
import { IconSymbol } from '@/components/ui/IconSymbol';

describe('TaskCard', () => {
  it('matches the snapshot', () => {
    const { toJSON } = render(
      <TaskCard
        text="Sample Task"
        selected={false}
        onDelete={() => {}}
        onSelect={() => {}}
        modifyTask={() => {}}
      />
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
