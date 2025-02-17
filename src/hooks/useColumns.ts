import { useState, useCallback } from 'react';
import { Column } from '@/types';

export const useColumns = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColumns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/columns');
      if (!response.ok) {
        throw new Error('Failed to fetch columns');
      }
      const { data } = await response.json();
      setColumns(data);
			
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch columns');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateColumn = useCallback(async (title: string) => {
    try {
      const response = await fetch('/api/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to create column');
      }

      const newColumn = await response.json();
      setColumns((prevColumns) => [...prevColumns, newColumn]);
      return newColumn;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create column');
    }
  }, []);

  const handleUpdateColumn = useCallback(async (columnId: string, title: string) => {
    try {
      const response = await fetch(`/api/columns?id=${columnId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to update column');
      }

      const updatedColumn = await response.json();
      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column._id === columnId ? updatedColumn : column
        )
      );
      return updatedColumn;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update column');
    }
  }, []);

  const handleDeleteColumn = useCallback(async (columnId: string) => {
    try {
      const response = await fetch(`/api/columns?id=${columnId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete column');
      }

      setColumns((prevColumns) =>
        prevColumns.filter((column) => column._id !== columnId)
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete column');
    }
  }, []);

  return {
    columns,
    loading,
		setColumns,
    error,
    fetchColumns,
    handleCreateColumn,
    handleUpdateColumn,
    handleDeleteColumn,
  };
}; 