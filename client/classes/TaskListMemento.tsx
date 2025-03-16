import { Task } from 'react-native';

export class TaskListMemento {
  private readonly tasks: Task[];

  constructor(tasks: Task[]) {
    this.tasks = JSON.parse(JSON.stringify(tasks));
  }

  getTasks(): Task[] {
    return JSON.parse(JSON.stringify(this.tasks));
  }
}
