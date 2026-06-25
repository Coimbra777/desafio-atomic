'use client';

import {
  type DragEndEvent,
  DndContext,
  DragOverlay,
} from '@dnd-kit/core';
import { useEffect, useMemo, useState } from 'react';

import {
  createTask,
  deleteTask,
  getTasks,
  getUsers,
  updateTask,
  updateTaskStatus,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { User } from '@/types/auth';
import type {
  CreateTaskPayload,
  Task,
  TaskStatus,
  UpdateTaskPayload,
} from '@/types/task';
import { TASK_STATUSES } from '@/types/task';

import { KanbanColumn } from './kanban-column';
import { TaskCardSurface } from './task-card';
import { TaskModal } from './task-modal';

const columns: Array<{
  status: TaskStatus;
  label: string;
  accentClassName: string;
}> = [
  { status: 'todo', label: 'A Fazer', accentClassName: 'text-ember' },
  {
    status: 'in_progress',
    label: 'Em Andamento',
    accentClassName: 'text-pine',
  },
  {
    status: 'in_review',
    label: 'Em Revisao',
    accentClassName: 'text-ink/70',
  },
  { status: 'done', label: 'Concluido', accentClassName: 'text-pine' },
];

type ModalState =
  | {
      mode: 'create';
      task: null;
    }
  | {
      mode: 'edit';
      task: Task;
    };

function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  return TASK_STATUSES.reduce(
    (groups, status) => ({
      ...groups,
      [status]: tasks.filter((task) => task.status === status),
    }),
    {
      todo: [] as Task[],
      in_progress: [] as Task[],
      in_review: [] as Task[],
      done: [] as Task[],
    },
  );
}

export function KanbanBoard(): JSX.Element {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    const authToken = token;

    async function loadBoard(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const [tasksPayload, usersPayload] = await Promise.all([
          getTasks(authToken),
          getUsers(authToken),
        ]);

        setTasks(tasksPayload);
        setUsers(usersPayload);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Nao foi possivel carregar o Kanban.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadBoard();
  }, [token]);

  const groupedTasks = useMemo(() => groupTasksByStatus(tasks), [tasks]);
  const activeTask =
    activeTaskId !== null
      ? tasks.find((task) => task.id === activeTaskId) ?? null
      : null;

  async function refreshTasks(): Promise<void> {
    if (!token) {
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const tasksPayload = await getTasks(token);
      setTasks(tasksPayload);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Nao foi possivel atualizar as tasks.',
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreateTask(payload: CreateTaskPayload): Promise<void> {
    if (!token) {
      return;
    }

    const createdTask = await createTask(payload, token);
    setTasks((current) => [createdTask, ...current]);
  }

  async function handleUpdateTask(
    taskId: string,
    payload: UpdateTaskPayload,
  ): Promise<void> {
    if (!token) {
      return;
    }

    const updatedTask = await updateTask(taskId, payload, token);
    setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
  }

  async function handleDeleteTask(taskId: string): Promise<void> {
    if (!token) {
      return;
    }

    await deleteTask(taskId, token);
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  async function handleMoveTask(
    taskId: string,
    nextStatus: TaskStatus,
  ): Promise<void> {
    if (!token) {
      return;
    }

    const currentTask = tasks.find((task) => task.id === taskId);

    if (!currentTask || currentTask.status === nextStatus) {
      return;
    }

    setStatusUpdatingId(taskId);
    setError(null);

    try {
      const updatedTask = await updateTaskStatus(
        taskId,
        { status: nextStatus },
        token,
      );
      setTasks((current) => current.map((task) => (task.id === taskId ? updatedTask : task)));
    } catch (moveError) {
      setError(
        moveError instanceof Error
          ? moveError.message
          : 'Nao foi possivel mover a task.',
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    setActiveTaskId(null);

    const taskId = String(event.active.id);
    const nextStatus = event.over?.id as TaskStatus | undefined;

    if (!nextStatus || !TASK_STATUSES.includes(nextStatus)) {
      return;
    }

    await handleMoveTask(taskId, nextStatus);
  }

  if (!token || !user) {
    return (
      <section className="panel-surface rounded-[2rem] p-6 text-sm text-ink/65">
        Validando sessao...
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="panel-surface flex flex-col gap-5 rounded-[2rem] px-5 py-5 lg:flex-row lg:items-end lg:justify-between lg:px-6">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-pine">
            Board visual
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Kanban inspirado em board horizontal
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/70">
            Crie cards, atribua responsaveis, arraste entre colunas e acompanhe o historico sem sair do fluxo principal.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-[1.1rem] border border-ink/10 bg-white px-5 py-3 text-sm font-display uppercase tracking-[0.18em] text-ink transition hover:bg-sand/35 disabled:opacity-60"
            disabled={loading || refreshing}
            onClick={() => void refreshTasks()}
            type="button"
          >
            {refreshing ? 'Atualizando...' : 'Recarregar'}
          </button>
          <button
            className="rounded-[1.1rem] bg-pine px-6 py-3 text-sm font-display uppercase tracking-[0.18em] text-white shadow-card transition hover:bg-pine/90"
            onClick={() => setModalState({ mode: 'create', task: null })}
            type="button"
          >
            Nova task
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map((column) => (
          <div
            key={column.status}
            className="rounded-[1.5rem] border border-ink/8 bg-white/55 px-4 py-4 backdrop-blur-sm"
          >
            <p className={`font-display text-xs uppercase tracking-[0.25em] ${column.accentClassName}`}>
              {column.label}
            </p>
            <p className="mt-2 text-sm text-ink/60">
              {groupedTasks[column.status].length} task(s) nesta etapa.
            </p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="panel-surface rounded-[2rem] p-8 text-sm text-ink/65">
          Carregando tasks e usuarios...
        </div>
      ) : (
        <DndContext
          onDragEnd={(event) => void handleDragEnd(event)}
          onDragStart={(event) => setActiveTaskId(String(event.active.id))}
        >
          <div className="soft-board board-scroll overflow-x-auto rounded-[2rem] p-4">
            <div className="flex min-w-max items-start gap-5">
            {columns.map((column) => (
              <KanbanColumn
                key={column.status}
                accentClassName={column.accentClassName}
                label={column.label}
                onSelectTask={(task) => setModalState({ mode: 'edit', task })}
                status={column.status}
                tasks={groupedTasks[column.status]}
              />
            ))}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? <TaskCardSurface dragging task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {statusUpdatingId ? (
        <div className="rounded-[1.5rem] border border-ink/10 bg-white/80 px-5 py-4 text-sm text-ink/65">
          Atualizando status de{' '}
          <span className="font-semibold text-ink">
            {tasks.find((task) => task.id === statusUpdatingId)?.title ?? 'task'}
          </span>
          ...
        </div>
      ) : null}

      {modalState ? (
        <TaskModal
          mode={modalState.mode}
          onClose={() => setModalState(null)}
          onCreate={handleCreateTask}
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTask}
          task={modalState.task}
          token={token}
          users={users}
        />
      ) : null}
    </section>
  );
}
