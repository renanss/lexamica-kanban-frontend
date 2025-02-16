'use client';

import { useState, useEffect } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { Task } from '@/types';

interface TaskFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: Pick<Task, 'title' | 'description' | 'columnId'>) => Promise<void>;
  initialData?: Task;
  columnId: string;
}

export function TaskForm({ show, onHide, onSubmit, initialData, columnId }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description ?? '');
      } else {
        setTitle('');
        setDescription('');
      }
      setError(null);
    }
  }, [show, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        title,
        description,
        columnId: initialData?.columnId ?? columnId,
      });
      setTitle('');
      setDescription('');
      onHide();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setError(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{initialData ? 'Edit Task' : 'New Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
} 