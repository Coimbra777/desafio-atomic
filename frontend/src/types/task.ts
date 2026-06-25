import type { User } from './auth';

export const TASK_STATUSES = ['todo', 'in_progress', 'in_review', 'done'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  assigneeId: string | null;
  createdById: string;
  assignee: User | null;
  creator: User;
  createdAt: string;
  updatedAt: string;
};

export type TaskMovement = {
  id: string;
  taskId: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  movedById: string;
  movedBy: User;
  createdAt: string;
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
  assigneeId?: string;
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
  assigneeId?: string | null;
};

export type UpdateTaskStatusPayload = {
  status: TaskStatus;
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'A Fazer',
  in_progress: 'Em Andamento',
  in_review: 'Em Revisão',
  done: 'Concluído',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};
