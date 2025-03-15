import { Task } from '@/modules/map/Types';

export class TaskListMemento {
  private readonly tasks: Task[];

  constructor(tasks: Task[]) {
    this.tasks = [...tasks];
  }

  getTasks(): Task[] {
    return [...this.tasks];
  }
}
