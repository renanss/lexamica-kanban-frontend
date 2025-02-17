import { render, screen, fireEvent } from '@testing-library/react';
import Column from '../column';
import { Column as ColumnType, Task } from '@/types';

// Mock TaskCard component to avoid DnD issues
jest.mock('@/components/tasks/task-card', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockTaskCard({ task, onEdit, onDelete }: any) {
    return (
      <div data-testid="task-card">
        <div>{task.title}</div>
        <button onClick={() => onEdit(task)}>Edit</button>
        <button onClick={() => onDelete(task._id)}>Delete</button>
      </div>
    );
  };
});

// Mock react-dnd hooks
jest.mock('react-dnd', () => ({
  useDrop: () => [{}, jest.fn()]
}));

// Mock the board provider
jest.mock('@/providers/board.provider', () => ({
  useBoard: () => ({
    handleCreateTask: jest.fn(),
    handleUpdateTask: jest.fn(),
    handleDeleteTask: jest.fn(),
    handleMoveTask: jest.fn(),
  }),
}));

const createMockColumn = (overrides: Partial<ColumnType> = {}): ColumnType => ({
  _id: 'col1',
  title: 'Test Column',
  order: 1,
  taskCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

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

describe('Column Component', () => {
  it('renders column title and task count', () => {
    const column = createMockColumn({ title: 'To Do', taskCount: 2 });
    const tasks = [
      createMockTask({ _id: 'task1' }),
      createMockTask({ _id: 'task2' }),
    ];

    render(<Column column={column} tasks={tasks} />);

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders add task button', () => {
    const column = createMockColumn();
    const tasks: Task[] = [];

    render(<Column column={column} tasks={tasks} />);

    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('renders task cards for each task', () => {
    const column = createMockColumn();
    const tasks = [
      createMockTask({ _id: 'task1', title: 'Task 1' }),
      createMockTask({ _id: 'task2', title: 'Task 2' }),
    ];

    render(<Column column={column} tasks={tasks} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('opens task form when add button is clicked', () => {
    const column = createMockColumn();
    const tasks: Task[] = [];

    render(<Column column={column} tasks={tasks} />);

    fireEvent.click(screen.getByText('Add'));
    
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('shows edit and delete buttons for each task', () => {
    const column = createMockColumn();
    const tasks = [createMockTask({ title: 'Task 1' })];

    render(<Column column={column} tasks={tasks} />);

    expect(screen.getAllByText('Edit')).toHaveLength(1);
    expect(screen.getAllByText('Delete')).toHaveLength(1);
  });

  it('displays error alert for invalid column data', () => {
    const invalidColumn = createMockColumn({ _id: '' });
    const tasks: Task[] = [];

    render(<Column column={invalidColumn} tasks={tasks} />);

    expect(screen.getByText('Invalid column data')).toBeInTheDocument();
  });
}); 