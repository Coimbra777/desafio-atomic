'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { PriorityBadge } from '@/components/ui/badge';
import type { Task } from '@/types/task';

type TaskCardSurfaceProps = {
  task: Task;
  onSelect?: (task: Task) => void;
  dragging?: boolean;
};

function formatDueDate(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function isPastDue(value: string | null): boolean {
  if (!value) return false;
  return new Date(value) < new Date();
}

export function TaskCardSurface({
  task,
  onSelect,
  dragging = false,
}: TaskCardSurfaceProps): JSX.Element {
  const dueDate = formatDueDate(task.dueDate);
  const overdue = isPastDue(task.dueDate);

  return (
    <button
      className={`task-card ${dragging ? 'opacity-80 rotate-1 shadow-card-hover scale-105' : ''}`}
      onClick={onSelect ? () => onSelect(task) : undefined}
      type="button"
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 text-sm font-semibold leading-snug text-ink">
          {task.title}
        </h3>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Description */}
      {task.description ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink/50">
          {task.description}
        </p>
      ) : null}

      {/* Tags */}
      {task.tags.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-ink/6 px-2 py-0.5 text-[0.65rem] font-medium text-ink/55"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink/6 pt-2.5">
        <span className="truncate text-[0.7rem] text-ink/45">
          {task.assignee?.name ?? 'Sem responsável'}
        </span>
        {dueDate ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${
              overdue
                ? 'bg-ember/10 text-ember'
                : 'bg-ink/6 text-ink/50'
            }`}
          >
            {dueDate}
          </span>
        ) : null}
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
      data: { taskId: task.id, status: task.status },
    });

  return (
    <div
      ref={setNodeRef}
      className="touch-none"
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
    >
      <TaskCardSurface task={task} onSelect={onSelect} dragging={isDragging} />
    </div>
  );
}
