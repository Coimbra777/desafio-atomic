import { PublicUser } from '../users/users.types';
import { TaskPriority } from './task-priority.enum';
import { TaskStatus } from './task-status.enum';

export type TaskResponse = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  assigneeId: string | null;
  createdById: string;
  assignee: PublicUser | null;
  creator: PublicUser;
  createdAt: string;
  updatedAt: string;
};

export type TaskMovementResponse = {
  id: string;
  taskId: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  movedById: string;
  movedBy: PublicUser;
  createdAt: string;
};

