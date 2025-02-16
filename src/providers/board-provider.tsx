'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { Column, Task } from '@/types';
import { websocketService } from '@/services/websocket';

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
}

export const BoardContext = createContext<BoardContextType>({
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
});

export function BoardProvider({ children }: { children: ReactNode }) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      // Add to new column
      const newColumnTasks = prev[movedTask.columnId] || [];
      const updatedNewColumnTasks = [...newColumnTasks, movedTask];

      return {
        ...prev,
        [movedTask.columnId]: updatedNewColumnTasks,
      };
    });
  }, []);

  const handleColumnWebSocketUpdate = useCallback((updatedColumn: Column) => {
    setColumns(prev => 
      prev.map(column => 
        column._id === updatedColumn._id ? updatedColumn : column
      )
    );
  }, []);

  const fetchColumns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/columns');
      if (!response.ok) {
        throw new Error('Failed to fetch columns');
      }
      const data = await response.json();
      setColumns(data.data);
			
      await Promise.all(data.data.map((column: Column) => fetchTasksByColumn(column._id)));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch columns');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTasksByColumn = async (columnId: string) => {
    if (!columnId) {
      console.error('Invalid column ID');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/column/${columnId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(prev => ({
        ...prev,
        [columnId]: data.data,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch tasks');
    }
  };

  const getTasksForColumn = useCallback((columnId: string) => {
    if (!columnId) {
      console.warn('Invalid column ID provided to getTasksForColumn');
      return [];
    }
    return tasks[columnId] || [];
  }, [tasks]);

  const handleUpdateTask = async (taskId: string, title: string, description: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task');
      throw error;
    }
  };

  const handleCreateTask = async (title: string, description: string, columnId: string) => {
    try {
      setError(null);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, columnId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create task');
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete task');
      throw error;
    }
  };

  const handleMoveTask = async (taskId: string, targetColumnId: string, order: number) => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetColumnId, order }),
      });

      if (!response.ok) {
        throw new Error('Failed to move task');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to move task');
      throw error;
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

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