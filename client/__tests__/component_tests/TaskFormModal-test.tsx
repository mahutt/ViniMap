import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskFormModal from '@/components/tasks/TaskFormModal';

jest.mock('@/components/LocationsAutocomplete', () => {
  return function MockedLocationsAutocomplete({
    callback,
  }: {
    callback: (location: { name: string; coordinates: [number, number] }) => void;
  }) {
    return (
      <div data-testid="locations-autocomplete">
        <button
          data-testid="select-location-btn"
          onClick={() => callback({ name: 'Test Location', coordinates: [1, 1] })}>
          Select Location
        </button>
      </div>
    );
  };
});

jest.mock('@/components/tasks/TimePicker', () => {
  return function MockedTimePicker({
    toggleStartTimePicker,
    clearStartTime,
  }: {
    toggleStartTimePicker: () => void;
    clearStartTime: () => void;
  }) {
    return (
      <div data-testid="time-picker">
        <button data-testid="toggle-time-picker-btn" onClick={toggleStartTimePicker}>
          Select Time
        </button>
        <button data-testid="clear-time-btn" onClick={clearStartTime}>
          Clear Time
        </button>
      </div>
    );
  };
});

describe('TaskFormModal', () => {
  const defaultProps = {
    modalVisible: true,
    setModalVisible: jest.fn(),
    taskName: '',
    setTaskName: jest.fn(),
    taskLocation: '',
    setTaskLocation: jest.fn(),
    taskStartTime: null,
    setTaskStartTime: jest.fn(),
    taskDuration: null,
    setTaskDuration: jest.fn(),
    showStartTimePicker: false,
    setShowStartTimePicker: jest.fn(),
    toggleStartTimePicker: jest.fn(),
    clearStartTime: jest.fn(),
    clearLocation: jest.fn(),
    addTask: jest.fn(),
    modifiableTask: null,
    saveTaskChanges: jest.fn(),
    setNewTaskLocation: jest.fn(),
    autocompleteVisible: false,
    setAutocompleteVisible: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the edit task modal correctly', () => {
    const editProps = {
      ...defaultProps,
      modifiableTask: {
        id: '1',
        text: 'Test Task',
        completed: false,
        location: { name: 'Test Location', coordinates: [1, 1] },
        startTime: new Date(),
        duration: 60,
      },
      taskName: 'Test Task',
    };

    const { getByText } = render(<TaskFormModal {...editProps} />);

    expect(getByText('Edit Task')).toBeTruthy();
    expect(getByText('Save Task')).toBeTruthy();
  });

  it('handles task name input', () => {
    const { getByPlaceholderText } = render(<TaskFormModal {...defaultProps} />);

    const input = getByPlaceholderText('Task name');
    fireEvent.changeText(input, 'New Task');

    expect(defaultProps.setTaskName).toHaveBeenCalledWith('New Task');
  });

  it('handles location input and shows autocomplete', () => {
    const { getByPlaceholderText } = render(<TaskFormModal {...defaultProps} />);

    const input = getByPlaceholderText('Location');
    fireEvent.changeText(input, 'San');

    expect(defaultProps.setTaskLocation).toHaveBeenCalledWith('San');
    expect(defaultProps.setAutocompleteVisible).toHaveBeenCalledWith(true);
  });

  it('hides autocomplete when location input is empty', () => {
    const { getByPlaceholderText } = render(<TaskFormModal {...defaultProps} />);

    const input = getByPlaceholderText('Location');
    fireEvent.changeText(input, '');

    expect(defaultProps.setAutocompleteVisible).toHaveBeenCalledWith(false);
  });

  it('clears location when clear button is pressed', () => {
    const propsWithLocation = {
      ...defaultProps,
      taskLocation: 'Test Location',
    };

    const { getByText } = render(<TaskFormModal {...propsWithLocation} />);

    const clearButton = getByText('✕');
    fireEvent.press(clearButton);

    expect(defaultProps.clearLocation).toHaveBeenCalled();
  });

  it('handles duration input correctly', () => {
    const { getByPlaceholderText } = render(<TaskFormModal {...defaultProps} />);

    const input = getByPlaceholderText('min');

    // valid number
    fireEvent.changeText(input, '30');
    expect(defaultProps.setTaskDuration).toHaveBeenCalledWith(30);

    // empty input
    fireEvent.changeText(input, '');
    expect(defaultProps.setTaskDuration).toHaveBeenCalledWith(null);

    // invalid input
    fireEvent.changeText(input, 'abc');
    expect(defaultProps.setTaskDuration).toHaveBeenCalledWith(0);
  });

  it('calls saveTaskChanges when Save Task button is pressed in edit mode', () => {
    const editProps = {
      ...defaultProps,
      modifiableTask: {
        id: '1',
        text: 'Test Task',
        completed: false,
        location: { name: 'Default Location', coordinates: [0, 0] },
        startTime: new Date(),
        duration: 30,
      },
    };

    const { getByText } = render(<TaskFormModal {...editProps} />);

    const saveButton = getByText('Save Task');
    fireEvent.press(saveButton);

    expect(defaultProps.saveTaskChanges).toHaveBeenCalled();
  });

  it('closes the modal when Close button is pressed', () => {
    const { getByText } = render(<TaskFormModal {...defaultProps} />);

    const closeButton = getByText('Close');
    fireEvent.press(closeButton);

    expect(defaultProps.setModalVisible).toHaveBeenCalledWith(false);
  });
});
