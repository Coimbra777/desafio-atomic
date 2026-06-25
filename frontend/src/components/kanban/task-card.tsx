'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import type { Task, TaskPriority } from '@/types/task';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/types/task';

type TaskCardSurfaceProps = {
  task: Task;
  onSelect?: (task: Task) => void;
  dragging?: boolean;
};

const priorityClasses: Record<TaskPriority, string> = {
  low: 'bg-[#dceae5] text-pine',
  medium: 'bg-[#f2e4c7] text-[#6f5131]',
  high: 'bg-[#f8d8cf] text-ember',
};

function formatDueDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function TaskCardSurface({
  task,
  onSelect,
  dragging = false,
}: TaskCardSurfaceProps): JSX.Element {
  const dueDateLabel = formatDueDate(task.dueDate);

  return (
    <button
      className={`panel-surface flex w-full flex-col gap-3 rounded-[1rem] px-4 py-3 text-left transition ${
        dragging
          ? 'cursor-grabbing opacity-80 shadow-card'
          : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card'
      }`}
      onClick={onSelect ? () => onSelect(task) : undefined}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-[0.62rem] uppercase tracking-[0.24em] text-ink/45">
            {TASK_STATUS_LABELS[task.status]}
          </p>
          <h3 className="mt-1.5 text-[0.98rem] font-semibold leading-6 text-ink">
            {task.title}
          </h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[0.62rem] font-display uppercase tracking-[0.16em] ${
            priorityClasses[task.priority]
          }`}
        >
          {TASK_PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      {task.description ? (
        <p className="line-clamp-3 text-sm leading-6 text-ink/72">
          {task.description}
        </p>
      ) : (
        <p className="text-sm italic text-ink/45">Sem descricao.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {task.tags.length > 0 ? (
          task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-ink/10 bg-[#f6f7f9] px-2.5 py-1 text-[0.7rem] text-ink/68"
            >
              #{tag}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-dashed border-ink/10 px-3 py-1 text-xs text-ink/45">
            Sem tags
          </span>
        )}
      </div>

      <div className="grid gap-2 rounded-[0.9rem] bg-[#f7f8fa] px-3 py-3 text-sm text-ink/68">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.14em] text-ink/44">
            Responsavel
          </span>
          <span className="font-medium text-ink">
            {task.assignee?.name ?? 'Nao atribuido'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-[0.14em] text-ink/44">
            Entrega
          </span>
          <span className="font-medium text-ink">
            {dueDateLabel ?? 'Sem prazo'}
          </span>
        </div>
      </div>
    </button>
  );
}

type TaskCardProps = {
  task: Task;
  onSelect: (task: Task) => void;
};

export function TaskCard({ task, onSelect }: TaskCardProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        taskId: task.id,
        status: task.status,
      },
    });

  return (
    <div
      ref={setNodeRef}
      className="touch-none"
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      {...listeners}
      {...attributes}
    >
      <TaskCardSurface task={task} onSelect={onSelect} dragging={isDragging} />
    </div>
  );
}
