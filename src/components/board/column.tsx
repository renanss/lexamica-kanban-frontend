'use client';

import { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Column as ColumnType, Task } from '@/types';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskForm } from '@/components/tasks/task-form';
import { useBoard } from '@/providers/board-provider';
import styles from './column.module.scss';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

export function Column({ column, tasks }: ColumnProps) {
  const { handleCreateTask, handleUpdateTask, handleDeleteTask } = useBoard();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const handleEdit = (task: Task) => {
    if (!task._id) {
      console.error('Cannot edit task without ID');
      return;
    }
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSubmit = async (data: Pick<Task, 'title' | 'description' | 'columnId'>) => {
    try {
      if (editingTask) {
        const taskId = editingTask._id || editingTask._id;
        if (!taskId) {
          throw new Error('Cannot update task without ID');
        }
        await handleUpdateTask(taskId, data.title, data.description || '');
      } else {
        await handleCreateTask(data.title, data.description || '', column._id);
      }
      setShowForm(false);
      setEditingTask(undefined);
    } catch (error) {
      console.error('Failed to save task:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleDelete = async (taskId: string) => {
    try {
      await handleDeleteTask(taskId, column._id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      // You might want to show an error message to the user here
    }
  };

  if (!column._id) {
    return (
      <Alert variant="danger">
        Invalid column data
      </Alert>
    );
  }

  return (
    <div className="d-flex flex-column h-100 gap-3">
      <Card className={`h-100 ${styles.column} ${styles.test}`}>
        <Card.Header className={styles.column__header}>
          <div className="d-flex align-items-center gap-2">
            <h3 className="h6 mb-0">{column.title}</h3>
            <span className="badge bg-secondary">{tasks.length}</span>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            Add
          </Button>
        </Card.Header>
        <Card.Body className={styles.column__task_list}>
          <div className="task-list d-flex flex-column gap-2">
            {tasks.map((task) => {
              const taskId = task._id;
              if (!taskId) return null;
              
              return (
                <TaskCard
                  key={taskId}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={() => handleDelete(taskId)}
                />
              );
            })}
          </div>
        </Card.Body>
      </Card>

      <TaskForm
        show={showForm}
        onHide={handleCloseForm}
        onSubmit={handleSubmit}
        initialData={editingTask}
        columnId={column._id}
      />
    </div>
  );
} 