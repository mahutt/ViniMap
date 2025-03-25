import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskRouteHeader from '@/components/TaskRouteHeader';
import { useMap, MapState } from '@/modules/map/MapContext';
import { useTask } from '@/providers/TaskContext';

jest.mock('@/modules/map/MapContext', () => ({
  useMap: jest.fn(),
  MapState: {
    Idle: 'idle',
  },
}));

jest.mock('@/providers/TaskContext', () => ({
  useTask: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('TaskRouteHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with task', () => {
    (useTask as jest.Mock).mockReturnValue({
      isTaskPlanning: true,
      selectedTasks: [{ text: 'Test Task' }],
    });

    (useMap as jest.Mock).mockReturnValue({
      setState: jest.fn(),
    });

    const { toJSON } = render(<TaskRouteHeader />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should not render when in RoutePlanning state', () => {
    (useTask as jest.Mock).mockReturnValue({
      selectedTasks: [{ text: 'Test Task' }],
    });

    (useMap as jest.Mock).mockReturnValue({
      setState: jest.fn(),
      state: 1, // RoutePlanning
    });

    const { toJSON } = render(<TaskRouteHeader />);
    expect(toJSON()).toBeNull();
  });

  it('should not render when selectedTasks is empty', () => {
    (useTask as jest.Mock).mockReturnValue({
      isTaskPlanning: true,
      selectedTasks: [],
    });

    (useMap as jest.Mock).mockReturnValue({
      setState: jest.fn(),
    });

    const { toJSON } = render(<TaskRouteHeader />);
    expect(toJSON()).toBeNull();
  });

  it('should call setState when close button is pressed', () => {
    const setStateMock = jest.fn();

    (useTask as jest.Mock).mockReturnValue({
      isTaskPlanning: true,
      selectedTasks: [{ text: 'Test Task' }],
    });

    (useMap as jest.Mock).mockReturnValue({
      setState: setStateMock,
    });
    const { getByTestId } = render(<TaskRouteHeader />);
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);

    expect(setStateMock).toHaveBeenCalledWith(MapState.Idle);
  });
});
