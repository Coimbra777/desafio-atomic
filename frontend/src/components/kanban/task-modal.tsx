'use client';

import { useEffect, useState } from 'react';

import { getTaskMovements } from '@/lib/api';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
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
  if (!value) return '';
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

const inputClass =
  'w-full rounded-lg border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15 placeholder:text-ink/30';

const labelClass = 'grid gap-1.5 text-sm';
const labelTextClass = 'text-xs font-medium text-ink/55';

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
            : 'Não foi possível carregar o histórico.',
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
    setFormState((current) => ({ ...current, [field]: value }));
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
          : 'Não foi possível salvar a task.',
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!task) return;
    setError(null);
    setDeleteLoading(true);

    try {
      await onDelete(task.id);
      onClose();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Não foi possível excluir a task.',
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/30 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-card-hover">
        {/* ── Modal header ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 border-b border-ink/8 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-pine">
              {mode === 'create' ? 'Nova task' : 'Editar task'}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">
              {mode === 'create' ? 'Criar novo card' : (task?.title ?? '')}
            </h2>
            {mode === 'edit' && task ? (
              <div className="mt-2">
                <StatusBadge status={task.status} />
              </div>
            ) : null}
          </div>
          <button
            className="rounded-lg border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink/60 transition hover:bg-ink/5 hover:text-ink"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </div>

        {/* ── Modal body ────────────────────────────────────────────── */}
        <div className="grid gap-6 p-6 xl:grid-cols-[1.35fr_0.65fr]">
          {/* Left: form */}
          <form className="grid gap-5" onSubmit={handleSubmit}>
            {/* Section: Informações */}
            <fieldset className="grid gap-4 rounded-xl border border-ink/8 p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-widest text-ink/40">
                Informações
              </legend>

              <label className={labelClass}>
                <span className={labelTextClass}>Título *</span>
                <input
                  className={inputClass}
                  maxLength={160}
                  onChange={(event) => updateField('title', event.target.value)}
                  placeholder="Nome da task..."
                  required
                  value={formState.title}
                />
              </label>

              <label className={labelClass}>
                <span className={labelTextClass}>Descrição</span>
                <textarea
                  className={`${inputClass} min-h-24 resize-none`}
                  onChange={(event) =>
                    updateField('description', event.target.value)
                  }
                  placeholder="Detalhe o que precisa ser feito..."
                  value={formState.description}
                />
              </label>
            </fieldset>

            {/* Section: Configuração */}
            <fieldset className="grid gap-4 rounded-xl border border-ink/8 p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-widest text-ink/40">
                Configuração
              </legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  <span className={labelTextClass}>Prioridade</span>
                  <select
                    className={inputClass}
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

                <label className={labelClass}>
                  <span className={labelTextClass}>Responsável</span>
                  <select
                    className={inputClass}
                    onChange={(event) =>
                      updateField('assigneeId', event.target.value)
                    }
                    value={formState.assigneeId}
                  >
                    <option value="">Sem responsável</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClass}>
                  <span className={labelTextClass}>Data de entrega</span>
                  <input
                    className={inputClass}
                    onChange={(event) =>
                      updateField('dueDate', event.target.value)
                    }
                    type="datetime-local"
                    value={formState.dueDate}
                  />
                </label>

                <label className={labelClass}>
                  <span className={labelTextClass}>Tags</span>
                  <input
                    className={inputClass}
                    onChange={(event) =>
                      updateField('tags', event.target.value)
                    }
                    placeholder="frontend, bug, mvp"
                    value={formState.tags}
                  />
                </label>
              </div>
            </fieldset>

            {error ? <Alert>{error}</Alert> : null}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-ink/40">
                {mode === 'edit' && task
                  ? `Atualizado em ${new Intl.DateTimeFormat('pt-BR').format(new Date(task.updatedAt))}`
                  : 'Novas tasks entram em "A Fazer".'}
              </p>

              <div className="flex items-center gap-2">
                {mode === 'edit' && task ? (
                  <Button
                    variant="danger"
                    size="md"
                    loading={deleteLoading}
                    disabled={submitLoading}
                    onClick={() => void handleDelete()}
                    type="button"
                  >
                    Excluir
                  </Button>
                ) : null}

                <Button
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                  type="button"
                >
                  Cancelar
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  loading={submitLoading}
                  disabled={deleteLoading}
                  type="submit"
                >
                  {mode === 'create' ? 'Criar task' : 'Salvar alterações'}
                </Button>
              </div>
            </div>
          </form>

          {/* Right: history + summary */}
          <aside className="grid content-start gap-4">
            {/* History */}
            <div className="rounded-xl border border-ink/8 bg-[#f8f9fb] p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-pine">
                Histórico
              </p>

              <div className="mt-3 grid gap-2">
                {mode === 'create' ? (
                  <p className="text-xs leading-relaxed text-ink/45">
                    O histórico aparece após a task ser criada e movida entre colunas.
                  </p>
                ) : historyLoading ? (
                  <p className="text-xs text-ink/45">Carregando histórico...</p>
                ) : movements.length > 0 ? (
                  <div className="relative grid gap-0">
                    {movements.map((movement, index) => (
                      <div key={movement.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="mt-1 h-2 w-2 rounded-full bg-pine/50 ring-2 ring-white" />
                          {index < movements.length - 1 ? (
                            <div className="w-px flex-1 bg-ink/8" />
                          ) : null}
                        </div>
                        <div className="pb-3">
                          <p className="text-xs font-medium text-ink">
                            {movement.fromStatus
                              ? `${TASK_STATUS_LABELS[movement.fromStatus]} → ${TASK_STATUS_LABELS[movement.toStatus]}`
                              : `Movida para ${TASK_STATUS_LABELS[movement.toStatus]}`}
                          </p>
                          <p className="mt-0.5 text-[0.65rem] text-ink/45">
                            {movement.movedBy.name} · {formatMovementDate(movement.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink/45">
                    Nenhuma movimentação registrada até agora.
                  </p>
                )}
              </div>
            </div>

            {/* Summary */}
            {mode === 'edit' && task ? (
              <div className="rounded-xl border border-ink/8 bg-[#f8f9fb] p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-ember">
                  Resumo
                </p>
                <dl className="mt-3 grid gap-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink/45">Criado por</dt>
                    <dd className="font-medium text-ink">{task.creator.name}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink/45">Status</dt>
                    <dd><StatusBadge status={task.status} /></dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-ink/45">Atualizada</dt>
                    <dd className="font-medium text-ink">
                      {new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }).format(new Date(task.updatedAt))}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
