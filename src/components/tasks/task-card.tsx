'use client';

import { useRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  index: number;
  columnId: string;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onMove: (dragIndex: number, hoverIndex: number, sourceColumnId: string, targetColumnId: string, dragId: string) => void;
}

interface DragItem {
  id: string;
  index: number;
  columnId: string;
  type: string;
}

const TaskCard = ({ task, index, columnId, onEdit, onDelete, onMove }: TaskCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task._id, index, columnId, type: 'TASK' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'TASK',
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceColumnId = item.columnId;
      const targetColumnId = columnId;

      if (dragIndex === hoverIndex && sourceColumnId === targetColumnId) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();

      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      onMove(dragIndex, hoverIndex, sourceColumnId, targetColumnId, item.id);

      item.index = hoverIndex;
      item.columnId = targetColumnId;
    },
  });

  drag(drop(ref));

  return (
    <Card 
      ref={ref}
      className="mb-3 shadow-sm"
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
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
            onClick={() => onDelete?.(task._id)}
          >
            Delete
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default TaskCard;