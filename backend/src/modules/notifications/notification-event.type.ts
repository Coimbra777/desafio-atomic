import { TaskStatus } from "../tasks/task-status.enum";

export type TaskAssignedNotificationEvent = {
  type: "task-assigned";
  recipientEmail: string;
  recipientName: string;
  taskId: string;
  taskTitle: string;
  assignedByEmail: string;
};

export type TaskStatusChangedNotificationEvent = {
  type: "task-status-changed";
  recipientEmail: string;
  recipientName: string;
  taskId: string;
  taskTitle: string;
  previousStatus: TaskStatus | null;
  currentStatus: TaskStatus;
};

export type TaskDueSoonNotificationEvent = {
  type: "task-due-soon";
  recipientEmail: string;
  recipientName: string;
  taskId: string;
  taskTitle: string;
  dueDate: string;
};

export type NotificationEvent =
  | TaskAssignedNotificationEvent
  | TaskStatusChangedNotificationEvent
  | TaskDueSoonNotificationEvent;
