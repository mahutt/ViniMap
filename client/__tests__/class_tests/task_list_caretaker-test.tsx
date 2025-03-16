import { TaskList } from '@/classes/TaskList';
import { TaskListCaretaker } from '@/classes/TaskListCaretaker';
import { Task } from '@/modules/map/Types';

describe('TaskListCaretaker Class', () => {
  let taskList: TaskList;
  let caretaker: TaskListCaretaker;
  let mockTask: Task;

  beforeEach(() => {
    taskList = new TaskList();
    caretaker = new TaskListCaretaker(taskList);
    mockTask = { id: '1', text: 'Test Task', coordinates: [0, 0] };
  });

  it('should save the task list state', () => {
    taskList.addTask(mockTask);
    caretaker.save();
    expect(caretaker.getHistorySize()).toBe(1);
  });

  it('should restore the previous state on undo', () => {
    taskList.addTask(mockTask);
    caretaker.save();

    taskList.addTask({ id: '2', text: 'Another Task', coordinates: [1, 1] });
    expect(taskList.getTasks().length).toBe(2);

    caretaker.undo();
    expect(taskList.getTasks()).toEqual([mockTask]);
  });

  it('should not fail when undo is called with no history', () => {
    expect(() => caretaker.undo()).not.toThrow();
    expect(taskList.getTasks()).toEqual([]);
  });

  it('should correctly track history size', () => {
    taskList.addTask(mockTask);
    caretaker.save();
    expect(caretaker.getHistorySize()).toBe(1);

    taskList.addTask({ id: '2', text: 'Another Task', coordinates: [1, 1] });
    caretaker.save();
    expect(caretaker.getHistorySize()).toBe(2);

    caretaker.undo();
    expect(caretaker.getHistorySize()).toBe(1);
  });
});
