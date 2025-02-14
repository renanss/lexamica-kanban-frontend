'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { Task } from '@/types';
import { TaskCard } from './task-card';
import { TaskForm } from './task-form';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching tasks...');
      
      const response = await fetch('/api/tasks');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to fetch tasks');
      }
      
      const data = await response.json();
      console.log('Tasks data:', data);
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
      
      setTasks(data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: Pick<Task, 'title' | 'description' | 'columnId'>) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create task');
    }

    fetchTasks();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleUpdateTask = async (data: Pick<Task, 'title' | 'description' | 'columnId'>) => {
    if (!editingTask) return;

    const response = await fetch(`/api/tasks?id=${editingTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update task');
    }

    setEditingTask(undefined);
    fetchTasks();
  };

  const handleDelete = async (taskId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }

      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-3">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" size="sm" onClick={fetchTasks}>
              Try Again
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0">Tasks</h2>
        <div className="d-flex gap-2">
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            Add Task
          </Button>
          <Button variant="outline-primary" size="sm" onClick={fetchTasks}>
            Refresh
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <Alert variant="info">
          No tasks found. Click "Add Task" to create one.
        </Alert>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      )}

      <TaskForm
        show={showForm}
        onHide={handleCloseForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        initialData={editingTask}
        columnId="todo" // TODO: Replace with actual column ID
      />
    </Container>
  );
} 