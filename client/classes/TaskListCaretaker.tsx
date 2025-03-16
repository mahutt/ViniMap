import { TaskList } from './TaskList';
import { TaskListMemento } from './TaskListMemento';

export class TaskListCaretaker {
  private readonly history: TaskListMemento[] = [];
  private readonly taskList: TaskList;

  constructor(taskList: TaskList) {
    this.taskList = taskList;
  }

  save(): void {
    this.history.push(this.taskList.save());
  }

  undo(): void {
    if (this.history.length > 0) {
      const memento = this.history.pop();
      if (memento) {
        this.taskList.restore(memento);
      }
    }
  }

  getHistorySize(): number {
    return this.history.length;
  }
}
