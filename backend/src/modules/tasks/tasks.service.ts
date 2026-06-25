import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import { NotificationsPublisherService } from "../notifications/notifications-publisher.service";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { TaskPriority } from "./task-priority.enum";
import { TaskStatus } from "./task-status.enum";
import { TaskMovement } from "./entities/task-movement.entity";
import { Task } from "./entities/task.entity";
import { TaskMovementResponse, TaskResponse } from "./tasks.types";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(TaskMovement)
    private readonly taskMovementsRepository: Repository<TaskMovement>,
    private readonly usersService: UsersService,
    private readonly notificationsPublisherService: NotificationsPublisherService,
  ) {}

  async findAll(): Promise<TaskResponse[]> {
    const tasks = await this.tasksRepository.find({
      relations: {
        assignee: true,
        creator: true,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return tasks.map((task) => this.toTaskResponse(task));
  }

  async create(
    payload: CreateTaskDto,
    authenticatedUser: AuthenticatedUser,
  ): Promise<TaskResponse> {
    const creator = await this.findRequiredUser(authenticatedUser.sub);
    const assignee = payload.assigneeId
      ? await this.findRequiredUser(payload.assigneeId)
      : null;

    const task = this.tasksRepository.create({
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status ?? TaskStatus.TODO,
      priority: payload.priority ?? TaskPriority.MEDIUM,
      dueDate: payload.dueDate ?? null,
      tags: payload.tags ?? [],
      assigneeId: assignee?.id ?? null,
      assignee,
      createdById: creator.id,
      creator,
    });

    const createdTask = await this.tasksRepository.save(task);
    const taskWithRelations = await this.findTaskEntityOrFail(createdTask.id);

    if (taskWithRelations.assignee) {
      this.notificationsPublisherService
        .publishTaskAssigned({
          type: "task-assigned",
          recipientEmail: taskWithRelations.assignee.email,
          recipientName: taskWithRelations.assignee.name,
          taskId: taskWithRelations.id,
          taskTitle: taskWithRelations.title,
          assignedByEmail: taskWithRelations.creator.email,
        })
        .catch((err: unknown) => {
          this.logger.warn(
            `[task:${taskWithRelations.id}] Falha ao enfileirar notificacao task-assigned: ${String(err)}`,
          );
        });
    }

    return this.toTaskResponse(taskWithRelations);
  }

  async findOne(id: string): Promise<TaskResponse> {
    const task = await this.findTaskEntityOrFail(id);

    return this.toTaskResponse(task);
  }

  async update(
    id: string,
    payload: UpdateTaskDto,
    authenticatedUser: AuthenticatedUser,
  ): Promise<TaskResponse> {
    const task = await this.findTaskEntityOrFail(id);
    const previousStatus = task.status;
    const previousAssigneeId = task.assigneeId;

    if (payload.title !== undefined) {
      task.title = payload.title;
    }

    if (payload.description !== undefined) {
      task.description = payload.description;
    }

    if (payload.status !== undefined) {
      task.status = payload.status;
    }

    if (payload.priority !== undefined) {
      task.priority = payload.priority;
    }

    if (payload.dueDate !== undefined) {
      task.dueDate = payload.dueDate;
    }

    if (payload.tags !== undefined) {
      task.tags = payload.tags;
    }

    if (payload.assigneeId !== undefined) {
      if (payload.assigneeId === null) {
        task.assigneeId = null;
        task.assignee = null;
      } else {
        const assignee = await this.findRequiredUser(payload.assigneeId);

        task.assigneeId = assignee.id;
        task.assignee = assignee;
      }
    }

    await this.tasksRepository.save(task);

    const updatedTask = await this.findTaskEntityOrFail(task.id);

    if (
      payload.assigneeId !== undefined &&
      updatedTask.assigneeId !== previousAssigneeId
    ) {
      if (updatedTask.assignee) {
        this.notificationsPublisherService
          .publishTaskAssigned({
            type: "task-assigned",
            recipientEmail: updatedTask.assignee.email,
            recipientName: updatedTask.assignee.name,
            taskId: updatedTask.id,
            taskTitle: updatedTask.title,
            assignedByEmail: updatedTask.creator.email,
          })
          .catch((err: unknown) => {
            this.logger.warn(
              `[task:${updatedTask.id}] Falha ao enfileirar notificacao task-assigned: ${String(err)}`,
            );
          });
      }
    }

    if (payload.status !== undefined && updatedTask.status !== previousStatus) {
      const movement = this.taskMovementsRepository.create({
        taskId: updatedTask.id,
        task: updatedTask,
        fromStatus: previousStatus,
        toStatus: updatedTask.status,
        movedById: authenticatedUser.sub,
        movedBy: await this.findRequiredUser(authenticatedUser.sub),
      });

      await this.taskMovementsRepository.save(movement);

      const recipient = updatedTask.assignee ?? updatedTask.creator;

      this.notificationsPublisherService
        .publishTaskStatusChanged({
          type: "task-status-changed",
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          taskId: updatedTask.id,
          taskTitle: updatedTask.title,
          previousStatus,
          currentStatus: updatedTask.status,
        })
        .catch((err: unknown) => {
          this.logger.warn(
            `[task:${updatedTask.id}] Falha ao enfileirar notificacao task-status-changed: ${String(err)}`,
          );
        });
    }

    return this.toTaskResponse(updatedTask);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findTaskEntityOrFail(id);

    await this.tasksRepository.remove(task);
  }

  async updateStatus(
    id: string,
    payload: UpdateTaskStatusDto,
    authenticatedUser: AuthenticatedUser,
  ): Promise<TaskResponse> {
    const task = await this.findTaskEntityOrFail(id);
    const previousStatus = task.status;

    if (previousStatus !== payload.status) {
      task.status = payload.status;
      await this.tasksRepository.save(task);

      const movement = this.taskMovementsRepository.create({
        taskId: task.id,
        task,
        fromStatus: previousStatus,
        toStatus: payload.status,
        movedById: authenticatedUser.sub,
        movedBy: await this.findRequiredUser(authenticatedUser.sub),
      });

      await this.taskMovementsRepository.save(movement);

      const updatedTaskWithRelations = await this.findTaskEntityOrFail(id);

      const recipient =
        updatedTaskWithRelations.assignee ?? updatedTaskWithRelations.creator;

      this.notificationsPublisherService
        .publishTaskStatusChanged({
          type: "task-status-changed",
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          taskId: updatedTaskWithRelations.id,
          taskTitle: updatedTaskWithRelations.title,
          previousStatus,
          currentStatus: updatedTaskWithRelations.status,
        })
        .catch((err: unknown) => {
          this.logger.warn(
            `[task:${updatedTaskWithRelations.id}] Falha ao enfileirar notificacao task-status-changed: ${String(err)}`,
          );
        });
    }

    const updatedTask = await this.findTaskEntityOrFail(id);

    return this.toTaskResponse(updatedTask);
  }

  async findMovements(taskId: string): Promise<TaskMovementResponse[]> {
    await this.findTaskEntityOrFail(taskId);

    const movements = await this.taskMovementsRepository.find({
      where: {
        taskId,
      },
      relations: {
        movedBy: true,
      },
      order: {
        createdAt: "DESC",
      },
    });

    return movements.map((movement) => this.toTaskMovementResponse(movement));
  }

  private async findTaskEntityOrFail(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: {
        id,
      },
      relations: {
        assignee: true,
        creator: true,
      },
    });

    if (!task) {
      throw new NotFoundException("Task not found.");
    }

    return task;
  }

  private async findRequiredUser(id: string): Promise<User> {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return user;
  }

  private toTaskResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      tags: task.tags,
      assigneeId: task.assigneeId,
      createdById: task.createdById,
      assignee: task.assignee
        ? this.usersService.toPublic(task.assignee)
        : null,
      creator: this.usersService.toPublic(task.creator),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  private toTaskMovementResponse(movement: TaskMovement): TaskMovementResponse {
    return {
      id: movement.id,
      taskId: movement.taskId,
      fromStatus: movement.fromStatus,
      toStatus: movement.toStatus,
      movedById: movement.movedById,
      movedBy: this.usersService.toPublic(movement.movedBy),
      createdAt: movement.createdAt.toISOString(),
    };
  }
}
