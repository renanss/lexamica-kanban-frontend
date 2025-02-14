'use client';

import { Card, Button } from 'react-bootstrap';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>{task.title}</Card.Title>
        {task.description && (
          <Card.Text className="text-muted">
            {task.description}
          </Card.Text>
        )}
        <div className="d-flex justify-content-end gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onEdit?.(task)}
          >
            Edit
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete?.(task.id)}
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
