'use client';

import { Alert } from 'react-bootstrap';
import Column from '@/components/board/column';
import { useBoard } from '@/providers/board.provider';
import styles from './board.module.scss';

const Board = () => {
  const { columns, getTasksForColumn, loading, error } = useBoard();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  return (
    <div className={styles.board}>
      {columns.map((column) => {
        const columnId = column._id;
        if (!columnId) return null;

        const columnTasks = getTasksForColumn(columnId);

        return (
          <Column
            key={columnId}
            column={column}
            tasks={columnTasks}
          />
        );
      })}
    </div>
  );
} 

export default Board;