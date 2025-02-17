import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from '../task-card';
import { Task } from '@/types';

// Mock react-dnd hooks
jest.mock('react-dnd', () => ({
  useDrag: () => [
    { isDragging: false },
    (element: any) => element,
    () => ({})
  ],
  useDrop: () => [
    {},
    (element: any) => element
  ]
}));

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  _id: 'task1',
  title: 'Test Task',
  description: 'Test Description',
  columnId: 'col1',
  order: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('TaskCard Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnMove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task title and description', () => {
    const task = createMockTask({
      title: 'Test Task Title',
      description: 'Test Task Description'
    });

    render(
      <TaskCard
        task={task}
        index={0}
        columnId="col1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMove={mockOnMove}
      />
    );

    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
    expect(screen.getByText('Test Task Description')).toBeInTheDocument();
  });

  it('renders without description when not provided', () => {
    const task = createMockTask({ description: undefined });

    render(
      <TaskCard
        task={task}
        index={0}
        columnId="col1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMove={mockOnMove}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const task = createMockTask();

    render(
      <TaskCard
        task={task}
        index={0}
        columnId="col1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMove={mockOnMove}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(task);
  });

  it('calls onDelete when delete button is clicked', () => {
    const task = createMockTask();

    render(
      <TaskCard
        task={task}
        index={0}
        columnId="col1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMove={mockOnMove}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith(task._id);
  });

  it('renders edit and delete buttons', () => {
    const task = createMockTask();

    render(
      <TaskCard
        task={task}
        index={0}
        columnId="col1"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onMove={mockOnMove}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
}); 