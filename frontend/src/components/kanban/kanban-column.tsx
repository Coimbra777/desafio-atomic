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
      className={`soft-board flex w-[300px] min-w-[300px] max-w-[300px] flex-col rounded-[1.4rem] px-3 py-3 transition ${
        isOver ? 'border-pine bg-[#eef6f2] shadow-card' : 'border-transparent'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-2 py-1">
        <div>
          <p className={`font-display text-[0.7rem] uppercase tracking-[0.28em] ${accentClassName}`}>
            {label}
          </p>
          <p className="mt-2 text-sm text-ink/55">{tasks.length} card(s)</p>
        </div>
        <div className="rounded-full border border-ink/10 bg-white px-3 py-1 text-sm font-semibold text-ink shadow-sm">
          {tasks.length}
        </div>
      </div>

      <div className="board-scroll grid max-h-[calc(100vh-18rem)] flex-1 content-start gap-3 overflow-y-auto pr-1">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onSelect={onSelectTask} />
          ))
        ) : (
          <div className="flex min-h-40 items-center justify-center rounded-[1.2rem] border border-dashed border-ink/12 bg-white/75 px-4 text-center text-sm leading-6 text-ink/45">
            Nenhum card nesta coluna.
            <br />
            Arraste um item para ca ou crie uma task nova.
          </div>
        )}
      </div>
    </section>
  );
}
