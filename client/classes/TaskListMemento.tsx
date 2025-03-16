import { Task } from '@/modules/map/Types';

export class TaskListMemento {
  private readonly tasks: Task[];

  constructor(tasks: Task[]) {
    this.tasks = JSON.parse(JSON.stringify(tasks));
  }

  getTasks(): Task[] {
    return JSON.parse(JSON.stringify(this.tasks));
  }
}
