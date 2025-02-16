export interface Column {
  _id: string;
  title: string;
  order: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  column?: {
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ApiError {
  code: number;
  message: string;
  stack?: string;
}

export interface DragItem {
  id: string;
  type: 'TASK';
  columnId: string;
  order: number;
}

export type TaskMove = {
  taskId: string;
  targetColumnId: string;
  order: number;
};
