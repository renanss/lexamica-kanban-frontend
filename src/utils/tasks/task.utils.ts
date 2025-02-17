import { Task } from '@/types';

export const taskUtils = {
  /**
   * Extracts the column ID from a task, handling both string and object formats
   */
  extractColumnId: (task: Task): string => {
    return typeof task.columnId === 'object' && (task.columnId as { _id: string })?._id 
      ? (task.columnId as { _id: string })._id 
      : task.columnId as string;
  },

  /**
   * Creates a normalized task with the correct columnId
   */
  normalizeTask: (task: Task, columnId: string): Task => {
    return {
      ...task,
      columnId,
    };
  },

  /**
   * Finds the column ID containing a specific task
   */
  findTaskColumn: (tasksMap: Record<string, Task[]>, taskId: string, defaultColumnId?: string): string | null => {
    for (const [colId, tasks] of Object.entries(tasksMap)) {
      if (tasks.some(task => task._id === taskId)) {
        return colId;
      }
    }
    return defaultColumnId ?? null;
  },

  /**
   * Updates a task in a column's task list
   */
  updateTaskInColumn: (tasks: Task[], updatedTask: Task): Task[] => {
    return tasks.map(task => task._id === updatedTask._id ? updatedTask : task);
  },

  /**
   * Removes a task from a column's task list
   */
  removeTaskFromColumn: (tasks: Task[], taskId: string): Task[] => {
    return tasks.filter(task => task._id !== taskId);
  },

  /**
   * Adds a task to a column's task list
   */
  addTaskToColumn: (tasks: Task[], task: Task): Task[] => {
    return [...tasks, task];
  },

  /**
   * Type guard to check if a value is a Task
   */
  isTask: (value: unknown): value is Task => {
    return (
      typeof value === 'object' &&
      value !== null &&
      '_id' in value &&
      'title' in value &&
      'columnId' in value
    );
  }
}; 