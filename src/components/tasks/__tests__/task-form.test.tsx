import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '../task-form';
import { Task } from '@/types';

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

describe('TaskForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnHide = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly for new task', () => {
    render(
      <TaskForm
        show={true}
        onHide={mockOnHide}
        onSubmit={mockOnSubmit}
        columnId="col1"
      />
    );

    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders form fields with initial data for editing', () => {
    const task = createMockTask({
      title: 'Edit Task',
      description: 'Edit Description'
    });

    render(
      <TaskForm
        show={true}
        onHide={mockOnHide}
        onSubmit={mockOnSubmit}
        initialData={task}
        columnId="col1"
      />
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Edit Description')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when submitted', async () => {
    render(
      <TaskForm
        show={true}
        onHide={mockOnHide}
        onSubmit={mockOnSubmit}
        columnId="col1"
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'New Task Title' }
    });

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'New Task Description' }
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'New Task Title',
        description: 'New Task Description',
        columnId: 'col1'
      });
    });
  });

  it('calls onHide when cancel button is clicked', () => {
    render(
      <TaskForm
        show={true}
        onHide={mockOnHide}
        onSubmit={mockOnSubmit}
        columnId="col1"
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnHide).toHaveBeenCalled();
  });

  it('displays loading state during submission', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <TaskForm
        show={true}
        onHide={mockOnHide}
        onSubmit={mockOnSubmit}
        columnId="col1"
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Task' }
    });

    fireEvent.submit(screen.getByRole('form'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    });
  });

  it('displays error message when submission fails', async () => {
    const errorMessage = 'Failed to save task';
    mockOnSubmit.mockRejectedValue(new Error(errorMessage));

    render(
      <TaskForm
        show={true}
        onHide={mockOnHide}
        onSubmit={mockOnSubmit}
        columnId="col1"
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Task' }
    });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('resets form when show prop changes', () => {
    const { rerender } = render(
      <TaskForm
        show={true}
        onHide={mockOnHide}
        onSubmit={mockOnSubmit}
        columnId="col1"
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Task' }
    });

    rerender(
      <TaskForm
        show={false}
        onHide={mockOnHide}
        onSubmit={mockOnSubmit}
        columnId="col1"
      />
    );

    rerender(
      <TaskForm
        show={true}
        onHide={mockOnHide}
        onSubmit={mockOnSubmit}
        columnId="col1"
      />
    );

    expect(screen.getByLabelText('Title')).toHaveValue('');
  });
}); 