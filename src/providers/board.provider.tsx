'use client';

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { Column, Task } from '@/types';
import { websocketService } from '@/services/websocket';
import { useColumns } from '@/hooks/useColumns';
import { useTasks } from '@/hooks/useTasks';
import { taskUtils } from '@/utils/tasks/task.utils';

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
      const columnId = taskUtils.extractColumnId(updatedTask);
      const currentColumnId = taskUtils.findTaskColumn(prev, updatedTask._id, columnId) ?? columnId;
      const normalizedTask = taskUtils.normalizeTask(updatedTask, currentColumnId);
      
      return {
        ...prev,
        [currentColumnId]: taskUtils.updateTaskInColumn(prev[currentColumnId] || [], normalizedTask),
      };
    });
  }, []);

  const handleTaskWebSocketCreate = useCallback((newTask: Task) => {
    setTasks(prev => {
      const columnId = taskUtils.extractColumnId(newTask);
      return {
        ...prev,
        [columnId]: taskUtils.addTaskToColumn(prev[columnId] || [], newTask),
      };
    });
  }, []);

  const handleTaskWebSocketDelete = useCallback((taskId: string, columnId: string) => {
    setTasks(prev => ({
      ...prev,
      [columnId]: taskUtils.removeTaskFromColumn(prev[columnId] || [], taskId),
    }));
  }, []);

  const handleTaskWebSocketMove = useCallback((movedTask: Task) => {
    setTasks(prev => {
      const targetColumnId = taskUtils.extractColumnId(movedTask);
      const sourceColumnId = taskUtils.findTaskColumn(prev, movedTask._id);
      const normalizedTask = taskUtils.normalizeTask(movedTask, targetColumnId);

      const newState = { ...prev };

      if (sourceColumnId && sourceColumnId !== targetColumnId) {
        newState[sourceColumnId] = taskUtils.removeTaskFromColumn(prev[sourceColumnId], movedTask._id);
      }

      newState[targetColumnId] = taskUtils.addTaskToColumn(prev[targetColumnId] || [], normalizedTask);

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

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
} 

export default BoardProvider;