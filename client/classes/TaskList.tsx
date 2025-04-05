import { TaskListMemento } from '@/classes/TaskListMemento';
import { Task } from '@/types';
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

  removeTask(id: string) {
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }

  save(): TaskListMemento {
    return new TaskListMemento(this.tasks);
  }

  restore(memento: TaskListMemento): void {
    this.tasks = memento.getTasks();
  }
}
