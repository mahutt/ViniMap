import { Task } from '@/types';
import { storage } from '@/services/StorageService';
import { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';

type TaskContextType = {
  selectedTasks: Task[];
  setSelectedTasks: (tasks: Task[]) => void;
  markTask: (taskId: string, completionState: boolean) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasksString = storage.getString('allTasks');

      if (!savedTasksString) {
        return [];
      }

      const savedTasks: Task[] = JSON.parse(savedTasksString);
      savedTasks.forEach((task) => {
        if (task.startTime) {
          task.startTime = new Date(task.startTime);
        }
      });
      return savedTasks;
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
      return [];
    }
  });

  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  useEffect(() => {
    try {
      storage.set('allTasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, [tasks]);

  const markTask = (taskId: string, completionState: boolean) => {
    setSelectedTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, completed: completionState } : task))
    );
  };

  const contextValue = useMemo(
    () => ({
      selectedTasks,
      setSelectedTasks,
      markTask,
      tasks,
      setTasks,
    }),
    [selectedTasks, tasks]
  );

  return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
