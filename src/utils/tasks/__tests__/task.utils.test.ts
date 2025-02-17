import '@testing-library/jest-dom';
import { taskUtils } from '../task.utils';
import { Task } from '@/types';

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  _id: '1',
  title: 'Test Task',
  description: '',
  columnId: 'col1',
  order: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('taskUtils', () => {
  describe('extractColumnId', () => {
    it('should extract string columnId', () => {
      const task = createMockTask({ columnId: '123' });
      expect(taskUtils.extractColumnId(task)).toBe('123');
    });

    it('should extract object columnId', () => {
      const task = createMockTask({
        columnId: { _id: '123' } as unknown as string
      });
      expect(taskUtils.extractColumnId(task)).toBe('123');
    });
  });

  describe('normalizeTask', () => {
    it('should create a new task with the specified columnId', () => {
      const task = createMockTask();
      const result = taskUtils.normalizeTask(task, '456');
      
      expect(result).toEqual({
        ...task,
        columnId: '456'
      });
    });

    it('should not modify the original task', () => {
      const task = createMockTask();
      const originalColumnId = task.columnId;
      
      taskUtils.normalizeTask(task, '456');
      
      expect(task.columnId).toBe(originalColumnId);
    });
  });

  describe('findTaskColumn', () => {
    const tasksMap = {
      'col1': [createMockTask({ _id: '1' })],
      'col2': [createMockTask({ _id: '2' })],
    };

    it('should find the column containing the task', () => {
      expect(taskUtils.findTaskColumn(tasksMap, '1')).toBe('col1');
      expect(taskUtils.findTaskColumn(tasksMap, '2')).toBe('col2');
    });

    it('should return null if task is not found', () => {
      expect(taskUtils.findTaskColumn(tasksMap, '3')).toBeNull();
    });

    it('should return default column if provided and task not found', () => {
      expect(taskUtils.findTaskColumn(tasksMap, '3', 'default')).toBe('default');
    });
  });

  describe('updateTaskInColumn', () => {
    const tasks = [
      createMockTask({ _id: '1', title: 'Task 1' }),
      createMockTask({ _id: '2', title: 'Task 2' }),
    ];

    it('should update matching task in the array', () => {
      const updatedTask = createMockTask({ _id: '1', title: 'Updated Task' });
      const result = taskUtils.updateTaskInColumn(tasks, updatedTask);
      
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Updated Task');
      expect(result[1]).toBe(tasks[1]);
    });

    it('should not modify original array', () => {
      const updatedTask = createMockTask({ _id: '1', title: 'Updated Task' });
      taskUtils.updateTaskInColumn(tasks, updatedTask);
      
      expect(tasks[0].title).toBe('Task 1');
    });
  });

  describe('removeTaskFromColumn', () => {
    const tasks = [
      createMockTask({ _id: '1' }),
      createMockTask({ _id: '2' }),
    ];

    it('should remove task from array', () => {
      const result = taskUtils.removeTaskFromColumn(tasks, '1');
      
      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('2');
    });

    it('should not modify original array', () => {
      taskUtils.removeTaskFromColumn(tasks, '1');
      
      expect(tasks).toHaveLength(2);
    });

    it('should return same array if task not found', () => {
      const result = taskUtils.removeTaskFromColumn(tasks, '3');
      
      expect(result).toHaveLength(2);
    });
  });

  describe('addTaskToColumn', () => {
    const tasks = [createMockTask()];

    it('should add task to array', () => {
      const newTask = createMockTask({ _id: '2' });
      const result = taskUtils.addTaskToColumn(tasks, newTask);
      
      expect(result).toHaveLength(2);
      expect(result[1]).toBe(newTask);
    });

    it('should not modify original array', () => {
      const newTask = createMockTask({ _id: '2' });
      taskUtils.addTaskToColumn(tasks, newTask);
      
      expect(tasks).toHaveLength(1);
    });
  });

  describe('isTask', () => {
    it('should return true for valid task', () => {
      const task = createMockTask();
      expect(taskUtils.isTask(task)).toBe(true);
    });

    it('should return false for invalid task', () => {
      expect(taskUtils.isTask(null)).toBe(false);
      expect(taskUtils.isTask({})).toBe(false);
      expect(taskUtils.isTask({ _id: '1' })).toBe(false);
      expect(taskUtils.isTask({ title: 'Test' })).toBe(false);
    });
  });
}); 