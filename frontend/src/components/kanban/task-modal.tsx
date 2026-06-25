'use client';

import { useEffect, useState } from 'react';

import { getTaskMovements } from '@/lib/api';
import type { User } from '@/types/auth';
import type {
  CreateTaskPayload,
  Task,
  TaskMovement,
  TaskPriority,
  UpdateTaskPayload,
} from '@/types/task';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@/types/task';

type TaskModalProps = {
  mode: 'create' | 'edit';
  task: Task | null;
  token: string;
  users: User[];
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<void>;
  onUpdate: (taskId: string, payload: UpdateTaskPayload) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
};

type FormState = {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  tags: string;
  assigneeId: string;
};

const initialFormState: FormState = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  tags: '',
  assigneeId: '',
};

function toLocalDateTimeInput(value: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function formatMovementDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function TaskModal({
  mode,
  task,
  token,
  users,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: TaskModalProps): JSX.Element {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [movements, setMovements] = useState<TaskMovement[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) {
      setFormState(initialFormState);
      setMovements([]);
      setError(null);
      return;
    }

    setFormState({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      dueDate: toLocalDateTimeInput(task.dueDate),
      tags: task.tags.join(', '),
      assigneeId: task.assigneeId ?? '',
    });
    setError(null);
  }, [task]);

  useEffect(() => {
    if (mode !== 'edit' || !task) {
      setMovements([]);
      return;
    }

    const taskId = task.id;

    async function loadMovements(): Promise<void> {
      setHistoryLoading(true);

      try {
        const payload = await getTaskMovements(taskId, token);
        setMovements(payload);
      } catch (movementError) {
        setError(
          movementError instanceof Error
            ? movementError.message
            : 'Nao foi possivel carregar o historico.',
        );
      } finally {
        setHistoryLoading(false);
      }
    }

    void loadMovements();
  }, [mode, task, token]);

  function updateField<Key extends keyof FormState>(
    field: Key,
    value: FormState[Key],
  ): void {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function buildPayload(): CreateTaskPayload | UpdateTaskPayload {
    const normalizedDueDate = formState.dueDate
      ? new Date(formState.dueDate).toISOString()
      : null;
    const normalizedDescription = formState.description.trim();
    const normalizedAssigneeId = formState.assigneeId || null;

    return {
      title: formState.title.trim(),
      description: normalizedDescription.length > 0 ? normalizedDescription : null,
      priority: formState.priority,
      dueDate: normalizedDueDate,
      tags: parseTags(formState.tags),
      assigneeId: normalizedAssigneeId,
    };
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);
    setSubmitLoading(true);

    try {
      const payload = buildPayload();

      if (mode === 'create') {
        await onCreate({
          title: payload.title ?? '',
          description: payload.description ?? undefined,
          priority: payload.priority,
          dueDate: payload.dueDate ?? null,
          tags: payload.tags,
          assigneeId: payload.assigneeId ?? undefined,
        });
      } else if (task) {
        await onUpdate(task.id, payload);
      }

      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Nao foi possivel salvar a task.',
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!task) {
      return;
    }

    setError(null);
    setDeleteLoading(true);

    try {
      await onDelete(task.id);
      onClose();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Nao foi possivel excluir a task.',
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(20,27,31,0.4)] px-4 py-8 backdrop-blur-sm">
      <div className="panel-surface w-full max-w-6xl rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-ink/10 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-pine">
              {mode === 'create' ? 'Nova task' : 'Editar task'}
            </p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              {mode === 'create' ? 'Preencha os dados do card' : task?.title}
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              {mode === 'create'
                ? 'As tasks criadas aqui entram no fluxo do Kanban e podem ser movidas por drag and drop.'
                : 'Atualize os dados da task, veja o historico e exclua o card se necessario.'}
            </p>
          </div>

          <button
            className="rounded-[1rem] border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-sand/30"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr,0.9fr]">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="rounded-[1.4rem] border border-ink/10 bg-[#f8fafb] p-4">
              <p className="font-display text-xs uppercase tracking-[0.22em] text-ink/55">
                Conteudo
              </p>
              <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm text-ink">
              <span className="font-display text-xs uppercase tracking-[0.2em] text-ink/60">
                Titulo
              </span>
              <input
                className="rounded-[1rem] border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-pine"
                maxLength={160}
                onChange={(event) => updateField('title', event.target.value)}
                required
                value={formState.title}
              />
            </label>

            <label className="grid gap-2 text-sm text-ink">
              <span className="font-display text-xs uppercase tracking-[0.2em] text-ink/60">
                Descricao
              </span>
              <textarea
                className="min-h-32 rounded-[1rem] border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-pine"
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                value={formState.description}
              />
            </label>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-ink/10 bg-[#f8fafb] p-4">
              <p className="font-display text-xs uppercase tracking-[0.22em] text-ink/55">
                Metadados
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-ink">
                <span className="font-display text-xs uppercase tracking-[0.2em] text-ink/60">
                  Prioridade
                </span>
                <select
                  className="rounded-[1rem] border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-pine"
                  onChange={(event) =>
                    updateField('priority', event.target.value as TaskPriority)
                  }
                  value={formState.priority}
                >
                  {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm text-ink">
                <span className="font-display text-xs uppercase tracking-[0.2em] text-ink/60">
                  Responsavel
                </span>
                <select
                  className="rounded-[1rem] border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-pine"
                  onChange={(event) => updateField('assigneeId', event.target.value)}
                  value={formState.assigneeId}
                >
                  <option value="">Sem responsavel</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-ink">
                <span className="font-display text-xs uppercase tracking-[0.2em] text-ink/60">
                  Data de entrega
                </span>
                <input
                  className="rounded-[1rem] border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-pine"
                  onChange={(event) => updateField('dueDate', event.target.value)}
                  type="datetime-local"
                  value={formState.dueDate}
                />
              </label>

              <label className="grid gap-2 text-sm text-ink">
                <span className="font-display text-xs uppercase tracking-[0.2em] text-ink/60">
                  Tags
                </span>
                <input
                  className="rounded-[1rem] border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-pine"
                  onChange={(event) => updateField('tags', event.target.value)}
                  placeholder="frontend, mvp, backlog"
                  value={formState.tags}
                />
              </label>
            </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-sm text-ink/55">
                {mode === 'edit' && task ? (
                  <span>Status atual: {TASK_STATUS_LABELS[task.status]}</span>
                ) : (
                  <span>Novas tasks entram em A Fazer.</span>
                )}
              </div>

                <div className="flex flex-wrap gap-3">
                {mode === 'edit' && task ? (
                  <button
                    className="rounded-[1rem] border border-red-200 bg-white px-5 py-3 text-sm font-display uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    disabled={submitLoading || deleteLoading}
                    onClick={() => void handleDelete()}
                    type="button"
                  >
                    {deleteLoading ? 'Excluindo...' : 'Excluir'}
                  </button>
                ) : null}

                <button
                  className="rounded-[1rem] bg-pine px-5 py-3 text-sm font-display uppercase tracking-[0.18em] text-white transition hover:bg-pine/90 disabled:opacity-60"
                  disabled={submitLoading || deleteLoading}
                  type="submit"
                >
                  {submitLoading
                    ? 'Salvando...'
                    : mode === 'create'
                      ? 'Criar task'
                      : 'Salvar alteracoes'}
                </button>
              </div>
            </div>
          </form>

          <aside className="grid gap-4">
            <div className="rounded-[1.4rem] border border-ink/10 bg-[#f8fafb] p-5">
              <p className="font-display text-xs uppercase tracking-[0.25em] text-pine">
                Historico
              </p>
              <div className="mt-4 grid gap-3">
                {mode === 'create' ? (
                  <p className="text-sm text-ink/60">
                    O historico de movimentacoes aparece depois que a task for criada e movida entre colunas.
                  </p>
                ) : historyLoading ? (
                  <p className="text-sm text-ink/60">Carregando historico...</p>
                ) : movements.length > 0 ? (
                  movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="rounded-[1rem] border border-ink/10 bg-white px-4 py-3 text-sm text-ink/75"
                    >
                      <p className="font-semibold text-ink">
                        {movement.fromStatus
                          ? `${TASK_STATUS_LABELS[movement.fromStatus]} -> ${TASK_STATUS_LABELS[movement.toStatus]}`
                          : `Movida para ${TASK_STATUS_LABELS[movement.toStatus]}`}
                      </p>
                      <p className="mt-1">
                        por {movement.movedBy.name} em {formatMovementDate(movement.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink/60">
                    Nenhuma movimentacao registrada ate agora.
                  </p>
                )}
              </div>
            </div>

            {mode === 'edit' && task ? (
              <div className="rounded-[1.4rem] border border-ink/10 bg-[#f8fafb] p-5 text-sm text-ink/70">
                <p className="font-display text-xs uppercase tracking-[0.25em] text-ember">
                  Resumo
                </p>
                <div className="mt-4 grid gap-2">
                  <p>
                    <span className="text-ink/50">Criador:</span> {task.creator.name}
                  </p>
                  <p>
                    <span className="text-ink/50">Status:</span> {TASK_STATUS_LABELS[task.status]}
                  </p>
                  <p>
                    <span className="text-ink/50">Atualizada em:</span>{' '}
                    {formatMovementDate(task.updatedAt)}
                  </p>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
