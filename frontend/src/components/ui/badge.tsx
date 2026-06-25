import { TASK_PRIORITY_LABELS } from '@/types/task';
import type { TaskPriority, TaskStatus } from '@/types/task';

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-pine/10 text-pine ring-1 ring-inset ring-pine/20',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  high: 'bg-ember/10 text-ember ring-1 ring-inset ring-ember/20',
};

const statusStyles: Record<TaskStatus, string> = {
  todo: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  in_progress: 'bg-pine/10 text-pine ring-1 ring-inset ring-pine/20',
  in_review: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200',
  done: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
};

const statusDotColors: Record<TaskStatus, string> = {
  todo: 'bg-amber-400',
  in_progress: 'bg-pine',
  in_review: 'bg-purple-500',
  done: 'bg-emerald-500',
};

const statusLabels: Record<TaskStatus, string> = {
  todo: 'A Fazer',
  in_progress: 'Em Andamento',
  in_review: 'Em Revisão',
  done: 'Concluído',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }): JSX.Element {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium tracking-wide ${priorityStyles[priority]}`}
    >
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusDotColors[status]}`} />
      {statusLabels[status]}
    </span>
  );
}

export function StatusDot({ status }: { status: TaskStatus }): JSX.Element {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${statusDotColors[status]}`}
    />
  );
}
