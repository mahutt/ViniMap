import { Task } from '@/modules/map/Types';
import { TaskList } from '@/classes/TaskList';

describe('TaskList Class', () => {
  let taskList: TaskList;
  let mockTask: Task;

  beforeEach(() => {
    taskList = new TaskList();
    mockTask = { id: '1', text: 'Test Task', coordinates: [0, 0] };
  });

  it('should add a task', () => {
    taskList.addTask(mockTask);
    expect(taskList.getTasks()).toEqual([mockTask]);
  });

  it('should set tasks', () => {
    const newTasks: Task[] = [
      { id: '1', text: 'Task 1', coordinates: [0, 0] },
      { id: '2', text: 'Task 2', coordinates: [1, 1] },
    ];
    taskList.setTasks(newTasks);
    expect(taskList.getTasks()).toEqual(newTasks);
  });

  it('should return a copy of tasks', () => {
    taskList.addTask(mockTask);
    const retrievedTasks = taskList.getTasks();
    retrievedTasks.push({ id: '2', text: 'Task 2', coordinates: [1, 1] });
    expect(taskList.getTasks()).toEqual([mockTask]);
  });

  it('should save and restore tasks', () => {
    taskList.addTask(mockTask);
    const memento = taskList.save();

    taskList.addTask({ id: '2', text: 'Another Task', coordinates: [1, 1] });
    expect(taskList.getTasks().length).toBe(2);

    taskList.restore(memento);
    expect(taskList.getTasks()).toEqual([mockTask]);
  });
});
