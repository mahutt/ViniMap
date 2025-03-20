import { Task, TaskRouteDescription } from '@/modules/map/Types';
import { storage } from '@/services/StorageService';
import { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';

type TaskContextType = {
  selectedTasks: Task[];
  setSelectedTasks: (tasks: Task[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  isTaskPlanning: boolean;
  setIsTaskPlanning: (isPlanning: boolean) => void;
  taskRouteDescriptions: TaskRouteDescription[];
  setTaskRouteDescriptions: (taskTimes: TaskRouteDescription[]) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = storage.getString('allTasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
      return [];
    }
  });

  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [isTaskPlanning, setIsTaskPlanning] = useState<boolean>(false);
  const [taskRouteDescriptions, setTaskRouteDescriptions] = useState<TaskRouteDescription[]>([]);

  useEffect(() => {
    try {
      if (tasks.length > 0) {
        storage.set('allTasks', JSON.stringify(tasks));
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }, [tasks]);

  const contextValue = useMemo(
    () => ({
      selectedTasks,
      setSelectedTasks,
      tasks,
      setTasks,
      isTaskPlanning,
      setIsTaskPlanning,
      taskRouteDescriptions,
      setTaskRouteDescriptions,
    }),
    [selectedTasks, tasks, isTaskPlanning]
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
