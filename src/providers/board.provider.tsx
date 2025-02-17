'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { Column, Task } from '@/types';
import { websocketService } from '@/services/websocket';
import { useColumns } from '@/hooks/useColumns';
import { useTasks } from '@/hooks/useTasks';
interface BoardContextType {
  columns: Column[];
  tasks: Record<string, Task[]>;
  loading: boolean;
  error: string | null;
  getTasksForColumn: (columnId: string) => Task[];
  handleCreateTask: (title: string, description: string, columnId: string) => Promise<void>;
  handleUpdateTask: (taskId: string, title: string, description: string) => Promise<void>;
  handleDeleteTask: (taskId: string, columnId: string) => Promise<void>;
  handleMoveTask: (taskId: string, targetColumnId: string, order: number) => Promise<void>;
  refreshBoard: () => Promise<void>;
	handleCreateColumn: (title: string) => Promise<void>;
	handleUpdateColumn: (columnId: string, title: string) => Promise<void>;
	handleDeleteColumn: (columnId: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextType>({
  columns: [],
  tasks: {},
  loading: true,
  error: null,
  getTasksForColumn: () => [],
  handleCreateTask: async () => {},
  handleUpdateTask: async () => {},
  handleDeleteTask: async () => {},
  handleMoveTask: async () => {},
  refreshBoard: async () => {},
	handleCreateColumn: async () => {},
	handleUpdateColumn: async () => {},
	handleDeleteColumn: async () => {},
});

const BoardProvider = ({ children }: { children: ReactNode }) => {
 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

	const { columns, loading: columnsLoading, error: columnsError, setColumns, fetchColumns, handleCreateColumn, handleUpdateColumn, handleDeleteColumn } = useColumns();
	const { tasks, loading: tasksLoading, error: tasksError, setTasks, getTasksForColumn, handleUpdateTask, handleCreateTask, handleDeleteTask, handleMoveTask, fetchTasksByColumn } = useTasks();
  const handleTaskWebSocketUpdate = useCallback((updatedTask: Task) => {
    setTasks(prev => {
      const columnId = typeof updatedTask.columnId === 'object' && (updatedTask.columnId as { _id: string })?._id 
        ? (updatedTask.columnId as { _id: string })._id 
        : updatedTask.columnId;

      let currentColumnId = columnId;
      for (const [colId, tasks] of Object.entries(prev)) {
        if (tasks.some(task => task._id === updatedTask._id)) {
          currentColumnId = colId;
          break;
        }
      }

      const normalizedTask = {
        ...updatedTask,
        columnId: currentColumnId,
      };

      return {
        ...prev,
        [currentColumnId]: prev[currentColumnId]?.map(task =>
          task._id === normalizedTask._id ? normalizedTask : task
        ) || [],
      };
    });
  }, []);

  const handleTaskWebSocketCreate = useCallback((newTask: Task) => {
    setTasks(prev => {
      const columnId = newTask.columnId;
      const columnTasks = prev[columnId] || [];
      
      return {
        ...prev,
        [columnId]: [...columnTasks, newTask],
      };
    });
  }, []);

  const handleTaskWebSocketDelete = useCallback((taskId: string, columnId: string) => {
    setTasks(prev => {
      const columnTasks = prev[columnId] || [];
      const updatedTasks = columnTasks.filter(task => task._id !== taskId);
      
      return {
        ...prev,
        [columnId]: updatedTasks,
      };
    });
  }, []);

  const handleTaskWebSocketMove = useCallback((movedTask: Task) => {
    setTasks(prev => {
      // Normalize the columnId (handle both string and object formats)
      const targetColumnId = typeof movedTask.columnId === 'object' 
        ? (movedTask.columnId as { _id: string })._id 
        : movedTask.columnId;

      // Find the source column by looking for the task in all columns
      let sourceColumnId: string | null = null;
      for (const [colId, tasks] of Object.entries(prev)) {
        if (tasks.some(task => task._id === movedTask._id)) {
          sourceColumnId = colId;
          break;
        }
      }

      const newState = { ...prev };

      // Remove from source column if found
      if (sourceColumnId) {
        newState[sourceColumnId] = prev[sourceColumnId].filter(
          task => task._id !== movedTask._id
        );
      }

      // Normalize the task object
      const normalizedTask = {
        ...movedTask,
        columnId: targetColumnId,
      };

      // Add to target column
      const targetColumnTasks = prev[targetColumnId] || [];
      newState[targetColumnId] = [...targetColumnTasks, normalizedTask];

      return newState;
    });
  }, []);

  const handleColumnWebSocketUpdate = useCallback((updatedColumn: Column) => {
    setColumns(prev => 
      prev.map(column => 
        column._id === updatedColumn._id ? updatedColumn : column
      )
    );
  }, []);


  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);
	

	useEffect(() => {
		Promise.all(columns.map((column: Column) => fetchTasksByColumn(column._id)));
	}, [columns]);

	useEffect(() => {
		setLoading(columnsLoading || tasksLoading);
		setError(columnsError || tasksError);
	}, [columnsLoading, tasksLoading, columnsError, tasksError]);

	useEffect(() => {
    websocketService.connect();

    websocketService.on('task:updated', handleTaskWebSocketUpdate);
    websocketService.on('task:created', handleTaskWebSocketCreate);
    websocketService.on('task:deleted', handleTaskWebSocketDelete);
    websocketService.on('task:moved', handleTaskWebSocketMove);
    websocketService.on('column:updated', handleColumnWebSocketUpdate);

    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <BoardContext.Provider
      value={{
        columns,
        tasks,
        loading,
        error,
        getTasksForColumn,
        handleCreateTask,
        handleUpdateTask,
        handleDeleteTask,
        handleMoveTask,
        refreshBoard: fetchColumns,
				handleCreateColumn,
				handleUpdateColumn,
				handleDeleteColumn,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

// Custom hook for using the board context
export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
} 

export default BoardProvider;