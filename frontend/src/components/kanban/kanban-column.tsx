'use client';

import { useDroppable } from '@dnd-kit/core';

import { TaskCard } from './task-card';
import type { Task, TaskStatus } from '@/types/task';

type KanbanColumnProps = {
  status: TaskStatus;
  label: string;
  accentClassName: string;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
};

export function KanbanColumn({
  status,
  label,
  accentClassName,
  tasks,
  onSelectTask,
}: KanbanColumnProps): JSX.Element {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: {
      status,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`panel-surface flex min-h-[28rem] flex-col rounded-[2rem] border px-4 py-4 transition sm:px-5 ${
        isOver ? 'border-pine bg-white/95 shadow-card' : 'border-transparent'
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3 px-1">
        <div>
          <p className={`font-display text-xs uppercase tracking-[0.28em] ${accentClassName}`}>
            {label}
          </p>
          <p className="mt-2 text-sm text-ink/60">{tasks.length} task(s)</p>
        </div>
        <div className="rounded-full border border-ink/10 bg-white/80 px-3 py-1 text-sm font-semibold text-ink">
          {tasks.length}
        </div>
      </div>

      <div className="grid flex-1 content-start gap-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onSelect={onSelectTask} />
          ))
        ) : (
          <div className="flex h-full min-h-40 items-center justify-center rounded-[1.5rem] border border-dashed border-ink/10 bg-white/50 px-4 text-center text-sm text-ink/45">
            Solte uma task aqui ou crie uma nova para esta etapa.
          </div>
        )}
      </div>
    </section>
  );
}
