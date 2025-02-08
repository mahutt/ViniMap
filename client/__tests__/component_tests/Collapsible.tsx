import { render } from '@testing-library/react-native';
import { fireEvent } from '@testing-library/react-native';
import React from 'react';
import { Collapsible } from '@/components/Collapsible';

describe('<Collapsible />', () => {
  test('renders correctly when collapsed', () => {
    const tree = render(<Collapsible title="Test Title">Test Content</Collapsible>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders correctly when expanded', () => {
    const { getByText, toJSON } = render(
      <Collapsible title="Test Title">Test Content</Collapsible>
    );

    fireEvent.press(getByText('Test Title'));

    expect(toJSON()).toMatchSnapshot();
  });
});
