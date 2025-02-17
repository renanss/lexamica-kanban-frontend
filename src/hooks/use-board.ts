import { useEffect } from 'react';
import { useBoardStore } from '@/store/board-store';
import { Task } from '@/types';

export function useBoard() {
  const {
    columns,
    tasks,
    loading,
    error,
    fetchColumns,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useBoardStore();

  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

  const getTasksForColumn = (columnId: string): Task[] => {
    return tasks[columnId] || [];
  };

  const handleCreateTask = async (
    title: string,
    description: string,
    columnId: string
  ) => {
    await createTask({ title, description, columnId });
  };

  const handleUpdateTask = async (
    taskId: string,
    title: string,
    description: string
  ) => {
    await updateTask(taskId, { title, description });
  };

  const handleDeleteTask = async (taskId: string, columnId: string) => {
    await deleteTask(taskId, columnId);
  };

  const handleMoveTask = async (
    taskId: string,
    targetColumnId: string,
    order: number
  ) => {
    await moveTask({ taskId, targetColumnId, order });
  };

  return {
    columns,
    getTasksForColumn,
    loading,
    error,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    handleMoveTask,
  };
}
