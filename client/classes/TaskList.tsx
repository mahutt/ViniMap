import { TaskListMemento } from '@/classes/TaskListMemento';
import { Task } from '@/modules/map/Types';
export class TaskList {
  private tasks: Task[] = [];

  setTasks(task: Task[]): void {
    this.tasks = [...task];
  }

  getTasks(): Task[] {
    return [...this.tasks];
  }

  addTask(task: Task): void {
    this.tasks.push(task);
  }

  save(): TaskListMemento {
    return new TaskListMemento(this.tasks);
  }

  restore(memento: TaskListMemento): void {
    this.tasks = memento.getTasks();
  }
}
