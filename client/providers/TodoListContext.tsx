import { Task } from '@/modules/map/Types';
import { createContext, useState, useContext, ReactNode } from 'react';

type TaskContextType = {
  selectedTasks: Task[];
  setSelectedTasks: (tasks: Task[]) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  return (
    <TaskContext.Provider value={{ selectedTasks, setSelectedTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
