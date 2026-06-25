import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, SelectQueryBuilder, Repository } from 'typeorm';

import { TaskMovement } from '../tasks/entities/task-movement.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskStatus } from '../tasks/task-status.enum';
import { DashboardSummaryQueryDto } from './dto/dashboard-summary-query.dto';
import {
  DashboardAssigneeSummary,
  DashboardCompletionSummary,
  DashboardStatusSummary,
  DashboardSummaryResponse,
} from './dashboard.types';

type DateRange = {
  startDate: Date | null;
  endDateExclusive: Date | null;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(TaskMovement)
    private readonly taskMovementsRepository: Repository<TaskMovement>,
  ) {}

  async getSummary(
    filters: DashboardSummaryQueryDto,
  ): Promise<DashboardSummaryResponse> {
    const range = this.buildDateRange(filters);

    const [byStatus, byAssignee, overdueTasks, completionsByDay] =
      await Promise.all([
        this.getStatusSummary(range),
        this.getAssigneeSummary(range),
        this.getOverdueTasksTotal(range),
        this.getCompletionsByDay(range),
      ]);

    const totalTasks = byStatus.reduce((sum, item) => sum + item.count, 0);
    const completedTasks =
      byStatus.find((item) => item.status === TaskStatus.DONE)?.count ?? 0;

    return {
      filters: {
        startDate: filters.startDate ?? null,
        endDate: filters.endDate ?? null,
      },
      totals: {
        totalTasks,
        overdueTasks,
        completedTasks,
      },
      byStatus,
      byAssignee,
      completionsByDay,
    };
  }

  private async getStatusSummary(
    range: DateRange,
  ): Promise<DashboardStatusSummary[]> {
    const rawRows = await this.applyTaskRange(
      this.tasksRepository
        .createQueryBuilder('task')
        .select('task.status', 'status')
        .addSelect('COUNT(task.id)', 'count')
        .groupBy('task.status'),
      range,
    ).getRawMany<{ status: TaskStatus; count: string }>();

    return Object.values(TaskStatus).map((status) => ({
      status,
      count:
        Number(rawRows.find((row) => row.status === status)?.count ?? '0') || 0,
    }));
  }

  private async getAssigneeSummary(
    range: DateRange,
  ): Promise<DashboardAssigneeSummary[]> {
    const rawRows = await this.applyTaskRange(
      this.tasksRepository
        .createQueryBuilder('task')
        .leftJoin('task.assignee', 'assignee')
        .select('task.assigneeId', 'assigneeId')
        .addSelect("COALESCE(assignee.name, 'Não atribuído')", 'assigneeName')
        .addSelect('COUNT(task.id)', 'count')
        .groupBy('task.assigneeId')
        .addGroupBy('assignee.name')
        .orderBy('COUNT(task.id)', 'DESC')
        .addOrderBy('assignee.name', 'ASC'),
      range,
    ).getRawMany<{ assigneeId: string | null; assigneeName: string; count: string }>();

    return rawRows.map((row) => ({
      assigneeId: row.assigneeId,
      assigneeName: row.assigneeName,
      count: Number(row.count) || 0,
    }));
  }

  private async getOverdueTasksTotal(range: DateRange): Promise<number> {
    const now = new Date();
    const count = await this.applyTaskRange(
      this.tasksRepository
        .createQueryBuilder('task')
        .where('task.dueDate IS NOT NULL')
        .andWhere('task.dueDate < :now', { now })
        .andWhere('task.status != :doneStatus', { doneStatus: TaskStatus.DONE }),
      range,
    ).getCount();

    return count;
  }

  private async getCompletionsByDay(
    range: DateRange,
  ): Promise<DashboardCompletionSummary[]> {
    const rawRows = await this.applyMovementRange(
      this.taskMovementsRepository
        .createQueryBuilder('movement')
        .select(`TO_CHAR(DATE(movement.createdAt), 'YYYY-MM-DD')`, 'date')
        .addSelect('COUNT(movement.id)', 'count')
        .where('movement.toStatus = :doneStatus', { doneStatus: TaskStatus.DONE })
        .groupBy('DATE(movement.createdAt)')
        .orderBy('DATE(movement.createdAt)', 'ASC'),
      range,
    ).getRawMany<{ date: string; count: string }>();

    return rawRows.map((row) => ({
      date: row.date,
      count: Number(row.count) || 0,
    }));
  }

  private applyTaskRange<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    range: DateRange,
  ): SelectQueryBuilder<T> {
    if (range.startDate) {
      queryBuilder.andWhere('task.createdAt >= :startDate', {
        startDate: range.startDate,
      });
    }

    if (range.endDateExclusive) {
      queryBuilder.andWhere('task.createdAt < :endDateExclusive', {
        endDateExclusive: range.endDateExclusive,
      });
    }

    return queryBuilder;
  }

  private applyMovementRange<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    range: DateRange,
  ): SelectQueryBuilder<T> {
    if (range.startDate) {
      queryBuilder.andWhere('movement.createdAt >= :startDate', {
        startDate: range.startDate,
      });
    }

    if (range.endDateExclusive) {
      queryBuilder.andWhere('movement.createdAt < :endDateExclusive', {
        endDateExclusive: range.endDateExclusive,
      });
    }

    return queryBuilder;
  }

  private buildDateRange(filters: DashboardSummaryQueryDto): DateRange {
    return {
      startDate: filters.startDate ? new Date(filters.startDate) : null,
      endDateExclusive: filters.endDate
        ? this.toExclusiveEndDate(filters.endDate)
        : null,
    };
  }

  private toExclusiveEndDate(value: string): Date {
    const endDate = new Date(value);

    if (!value.includes('T')) {
      endDate.setUTCDate(endDate.getUTCDate() + 1);

      return endDate;
    }

    return new Date(endDate.getTime() + 1000);
  }
}
