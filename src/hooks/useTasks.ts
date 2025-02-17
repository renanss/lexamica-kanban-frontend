import { useState, useCallback } from 'react';
import { Task } from '@/types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
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
			setLoading(false);
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
      
      // Find the source column and task
      let sourceColumnId: string | null = null;
      let movedTask: Task | null = null;
      
      // Find the source column and task in the current state
      for (const [colId, columnTasks] of Object.entries(tasks)) {
        const task = (columnTasks as Task[]).find(t => t._id === taskId);
        if (task) {
          sourceColumnId = colId;
          movedTask = task;
          break;
        }
      }

      if (!sourceColumnId || !movedTask) {
        throw new Error('Task not found');
      }

      // Optimistically update the UI
      setTasks(prev => {
        const newState = { ...prev };
        
        // Remove from source column
        newState[sourceColumnId!] = prev[sourceColumnId!].filter(
          task => task._id !== taskId
        );
        
        // Add to target column with new order
        const targetTasks = prev[targetColumnId] || [];
        const updatedTask = { ...movedTask!, columnId: targetColumnId, order };
        newState[targetColumnId] = [...targetTasks, updatedTask]
          .sort((a, b) => a.order - b.order);
        
        return newState;
      });

      // Make the API call
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetColumnId, order }),
      });

      if (!response.ok) {
        // If the API call fails, revert the optimistic update
        setTasks(prev => {
          const newState = { ...prev };
          
          // Remove from target column
          newState[targetColumnId] = prev[targetColumnId].filter(
            task => task._id !== taskId
          );
          
          // Add back to source column
          const sourceTasks = prev[sourceColumnId!] || [];
          newState[sourceColumnId!] = [...sourceTasks, movedTask!]
            .sort((a, b) => a.order - b.order);
          
          return newState;
        });
        
        throw new Error('Failed to move task');
      }

      // Get the updated task from the response
      const updatedTask = await response.json();
      
      // Update with the server response to ensure consistency
      setTasks(prev => {
        const newState = { ...prev };
        const targetTasks = prev[targetColumnId] || [];
        newState[targetColumnId] = targetTasks
          .filter(task => task._id !== taskId)
          .concat(updatedTask)
          .sort((a, b) => a.order - b.order);
        return newState;
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to move task');
      throw error;
    }
  };

	return {
		tasks,
		loading,
		error,
		setTasks,
		getTasksForColumn,
		handleUpdateTask,
		handleCreateTask,
		handleDeleteTask,
		handleMoveTask,
		fetchTasksByColumn,
	}
}