'use client';

import { useState, useRef } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { useDrop } from 'react-dnd';
import { Column as ColumnType, Task } from '@/types';
import TaskCard from '@/components/tasks/task-card';
import TaskForm from '@/components/tasks/task-form';
import { useBoard } from '@/providers/board.provider';
import styles from './column.module.scss';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
}

const Column = ({ column, tasks }: ColumnProps) => {
  const { handleCreateTask, handleUpdateTask, handleDeleteTask, handleMoveTask } = useBoard();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: string, columnId: string, type: string }, monitor) => {
      if (!monitor.didDrop()) {
        if (item.columnId !== column._id) {
          console.log('Moving task:', item.id, 'from:', item.columnId, 'to:', column._id);
          const lastTaskOrder = tasks.length > 0 ? tasks[tasks.length - 1].order : 0;
          handleMoveTask(item.id, column._id, lastTaskOrder + 1);
        }
      }
    },
  });

  drop(ref);

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
        const taskId = editingTask._id;
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
    }
  };

  const handleMove = (dragIndex: number, hoverIndex: number, sourceColumnId: string, targetColumnId: string, dragId: string) => {
    let newOrder: number;
    
    const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
    
    if (hoverIndex === 0) {
      newOrder = sortedTasks[0] ? Math.floor(sortedTasks[0].order - 1000) : 0;
    } else if (hoverIndex >= tasks.length) {
      newOrder = sortedTasks[sortedTasks.length - 1] ? Math.floor(sortedTasks[sortedTasks.length - 1].order + 1000) : 1000;
    } else {
      const prevTask = sortedTasks[hoverIndex - 1];
      const nextTask = sortedTasks[hoverIndex];
      
      if (dragIndex < hoverIndex) {
        // Moving downward
        newOrder = Math.floor(nextTask.order + 1000);
      } else {
        // Moving upward
        newOrder = Math.floor(prevTask.order - 1000);
      }
    }

    newOrder = Math.max(0, newOrder);
    
    handleMoveTask(dragId, targetColumnId, newOrder);
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
      <Card ref={ref} className={`h-100 ${styles.column}`}>
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
            {tasks.map((task, index) => {
              const taskId = task._id;
              if (!taskId) return null;
              
              return (
                <TaskCard
                  key={`${taskId}-${index}`}
                  task={task}
                  index={index}
                  columnId={column._id}
                  onEdit={handleEdit}
                  onDelete={() => handleDelete(taskId)}
                  onMove={(dragIndex, hoverIndex, sourceColumnId, targetColumnId, dragId) => 
                    handleMove(dragIndex, hoverIndex, sourceColumnId, targetColumnId, dragId)}
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

export default Column;