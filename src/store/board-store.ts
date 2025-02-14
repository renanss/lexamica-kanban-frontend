import { create } from 'zustand';
import { Column, Task, TaskMove } from '@/types';
import { columnsAPI, tasksAPI } from '@/services/api';

interface BoardState {
  columns: Column[];
  tasks: Record<string, Task[]>;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchColumns: () => Promise<void>;
  fetchTasksByColumn: (columnId: string) => Promise<void>;
  createTask: (data: Pick<Task, 'title' | 'description' | 'columnId'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Pick<Task, 'title' | 'description'>>) => Promise<void>;
  deleteTask: (id: string, columnId: string) => Promise<void>;
  moveTask: (move: TaskMove) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  columns: [],
  tasks: {},
  loading: false,
  error: null,

  fetchColumns: async () => {
    set({ loading: true, error: null });
    try {
      const response = await columnsAPI.getAll();
      set({ columns: response.data });
      
      // Fetch tasks for each column
      await Promise.all(
        response.data.map(column => get().fetchTasksByColumn(column.id))
      );
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch columns' });
    } finally {
      set({ loading: false });
    }
  },

  fetchTasksByColumn: async (columnId: string) => {
    try {
      const response = await tasksAPI.getByColumn(columnId);
      set(state => ({
        tasks: {
          ...state.tasks,
          [columnId]: response.data,
        },
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch tasks' });
    }
  },

  createTask: async (data) => {
    set({ loading: true, error: null });
    try {
      await tasksAPI.create(data);
      await get().fetchTasksByColumn(data.columnId);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create task' });
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const task = await tasksAPI.update(id, data);
      await get().fetchTasksByColumn(task.columnId);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update task' });
    } finally {
      set({ loading: false });
    }
  },

  deleteTask: async (id, columnId) => {
    set({ loading: true, error: null });
    try {
      await tasksAPI.delete(id);
      await get().fetchTasksByColumn(columnId);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete task' });
    } finally {
      set({ loading: false });
    }
  },

  moveTask: async ({ taskId, targetColumnId, order }) => {
    set({ loading: true, error: null });
    try {
      const task = await tasksAPI.move(taskId, { targetColumnId, order });
      
      // Refresh both source and target columns
      const sourceColumnId = get().tasks[task.columnId]?.find(t => t.id === taskId)?.columnId;
      if (sourceColumnId) {
        await get().fetchTasksByColumn(sourceColumnId);
      }
      await get().fetchTasksByColumn(targetColumnId);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to move task' });
    } finally {
      set({ loading: false });
    }
  },
}));
