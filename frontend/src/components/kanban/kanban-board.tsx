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
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
  dotClassName: string;
}> = [
  {
    status: 'todo',
    label: 'A Fazer',
    accentClassName: 'text-amber-600',
    dotClassName: 'bg-amber-400',
  },
  {
    status: 'in_progress',
    label: 'Em Andamento',
    accentClassName: 'text-pine',
    dotClassName: 'bg-pine',
  },
  {
    status: 'in_review',
    label: 'Em Revisão',
    accentClassName: 'text-purple-600',
    dotClassName: 'bg-purple-500',
  },
  {
    status: 'done',
    label: 'Concluído',
    accentClassName: 'text-emerald-700',
    dotClassName: 'bg-emerald-500',
  },
];

type ModalState =
  | { mode: 'create'; task: null }
  | { mode: 'edit'; task: Task };

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
    if (!token) return;

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
            : 'Não foi possível carregar o Kanban.',
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
    if (!token) return;
    setRefreshing(true);
    setError(null);

    try {
      const tasksPayload = await getTasks(token);
      setTasks(tasksPayload);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : 'Não foi possível atualizar as tasks.',
      );
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreateTask(payload: CreateTaskPayload): Promise<void> {
    if (!token) return;
    const createdTask = await createTask(payload, token);
    setTasks((current) => [createdTask, ...current]);
  }

  async function handleUpdateTask(
    taskId: string,
    payload: UpdateTaskPayload,
  ): Promise<void> {
    if (!token) return;
    const updatedTask = await updateTask(taskId, payload, token);
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? updatedTask : task)),
    );
  }

  async function handleDeleteTask(taskId: string): Promise<void> {
    if (!token) return;
    await deleteTask(taskId, token);
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  async function handleMoveTask(
    taskId: string,
    nextStatus: TaskStatus,
  ): Promise<void> {
    if (!token) return;

    const currentTask = tasks.find((task) => task.id === taskId);
    if (!currentTask || currentTask.status === nextStatus) return;

    setStatusUpdatingId(taskId);
    setError(null);

    try {
      const updatedTask = await updateTaskStatus(
        taskId,
        { status: nextStatus },
        token,
      );
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? updatedTask : task)),
      );
    } catch (moveError) {
      setError(
        moveError instanceof Error
          ? moveError.message
          : 'Não foi possível mover a task.',
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    setActiveTaskId(null);
    const taskId = String(event.active.id);
    const nextStatus = event.over?.id as TaskStatus | undefined;

    if (!nextStatus || !TASK_STATUSES.includes(nextStatus)) return;
    await handleMoveTask(taskId, nextStatus);
  }

  if (!token || !user) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-white text-sm text-ink/50 shadow-panel">
        Validando sessão...
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {/* ── Board header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">
            Quadro Kanban
          </h1>
          <p className="mt-0.5 text-sm text-ink/50">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} no total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={refreshing}
            disabled={loading}
            onClick={() => void refreshTasks()}
            type="button"
          >
            {refreshing ? 'Atualizando...' : 'Recarregar'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalState({ mode: 'create', task: null })}
            type="button"
          >
            + Nova task
          </Button>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {error ? <Alert>{error}</Alert> : null}

      {/* ── Status update toast ───────────────────────────────────────── */}
      {statusUpdatingId ? (
        <Alert variant="info">
          Movendo{' '}
          <strong>
            {tasks.find((t) => t.id === statusUpdatingId)?.title ?? 'task'}
          </strong>
          ...
        </Alert>
      ) : null}

      {/* ── Board ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl bg-white text-sm text-ink/50 shadow-panel">
          Carregando tasks e usuários...
        </div>
      ) : (
        <DndContext
          onDragEnd={(event) => void handleDragEnd(event)}
          onDragStart={(event) => setActiveTaskId(String(event.active.id))}
        >
          <div className="board-scroll overflow-x-auto rounded-2xl">
            <div className="flex min-w-max items-start gap-3 p-3">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.status}
                  accentClassName={column.accentClassName}
                  dotClassName={column.dotClassName}
                  label={column.label}
                  onSelectTask={(task) => setModalState({ mode: 'edit', task })}
                  status={column.status}
                  tasks={groupedTasks[column.status]}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCardSurface dragging task={activeTask} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────── */}
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
    </div>
  );
}
