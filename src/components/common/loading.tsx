'use client';

import { Spinner } from 'react-bootstrap';

interface LoadingProps {
  fullscreen?: boolean;
}

export function Loading({ fullscreen = false }: LoadingProps) {
  const content = (
    <div className="d-flex justify-content-center align-items-center p-4">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex justify-content-center align-items-center" style={{ zIndex: 1050 }}>
        {content}
      </div>
    );
  }

  return content;
}
