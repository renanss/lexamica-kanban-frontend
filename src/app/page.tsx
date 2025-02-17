import { TaskList } from '@/components/tasks/task-list';

export default function Home() {
  return (
    <div>
      <h1 className="text-center mb-4">Tasks</h1>
      <TaskList />
    </div>
  );
}
