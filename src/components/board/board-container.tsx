'use client';

import { useBoard } from '@/providers/board-provider';
import { Alert, Button, Container } from 'react-bootstrap';
import { Loading } from '@/components/common/loading';
import { Column } from './column';

export function BoardContainer() {
  const {
    columns,
    loading,
    error,
    refreshBoard,
    getTasksForColumn,
  } = useBoard();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Container className="py-3">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={refreshBoard}>
              Try Again
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <Container className="py-3">
        <Alert variant="info">
          <Alert.Heading>No Columns Found</Alert.Heading>
          <p>There are no columns available. Please check the database initialization.</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-primary" onClick={refreshBoard}>
              Refresh
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="board-container h-100">
      <div className="board-scroll h-100 p-3">
        <div className="board h-100 d-flex gap-3">
          {columns.map((column) => (
            column._id ? (
              <Column
                key={column._id}
                column={column}
                tasks={getTasksForColumn(column._id)}
              />
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
}
