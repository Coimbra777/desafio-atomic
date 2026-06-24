import type { TaskStatus } from './task';

export type DashboardSummaryFilters = {
  startDate?: string;
  endDate?: string;
};

export type DashboardStatusSummary = {
  status: TaskStatus;
  count: number;
};

export type DashboardAssigneeSummary = {
  assigneeId: string | null;
  assigneeName: string;
  count: number;
};

export type DashboardCompletionSummary = {
  date: string;
  count: number;
};

export type DashboardSummary = {
  filters: {
    startDate: string | null;
    endDate: string | null;
  };
  totals: {
    totalTasks: number;
    overdueTasks: number;
    completedTasks: number;
  };
  byStatus: DashboardStatusSummary[];
  byAssignee: DashboardAssigneeSummary[];
  completionsByDay: DashboardCompletionSummary[];
};
