'use client';

import { useDroppable } from '@dnd-kit/core';

import { TaskCard } from './task-card';
import type { Task, TaskStatus } from '@/types/task';

type KanbanColumnProps = {
  status: TaskStatus;
  label: string;
  accentClassName: string;
  dotClassName: string;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
};

export function KanbanColumn({
  status,
  label,
  accentClassName,
  dotClassName,
  tasks,
  onSelectTask,
}: KanbanColumnProps): JSX.Element {
  const { isOver, setNodeRef } = useDroppable({ id: status, data: { status } });

  return (
    <section
      ref={setNodeRef}
      className={`flex w-[280px] min-w-[280px] max-w-[280px] flex-col rounded-2xl transition-colors ${
        isOver ? 'bg-pine/5 ring-2 ring-pine/20' : 'bg-[#eaedf0]'
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3.5 py-3">
        <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
        <h2 className={`flex-1 text-xs font-semibold uppercase tracking-widest ${accentClassName}`}>
          {label}
        </h2>
        <span className="rounded-full bg-ink/8 px-2 py-0.5 text-xs font-medium text-ink/55">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="board-scroll flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-3"
           style={{ maxHeight: 'calc(100vh - 14rem)' }}>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onSelect={onSelectTask} />
          ))
        ) : (
          <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-ink/15 bg-white/60 px-4 py-6 text-center text-xs text-ink/40">
            Arraste um card para cá
            <br />
            ou crie uma nova task.
          </div>
        )}
      </div>
    </section>
  );
}
