import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Job, Queue } from "bullmq";

import {
  NotificationEvent,
  TaskAssignedNotificationEvent,
  TaskStatusChangedNotificationEvent,
} from "./notification-event.type";
import { EMAIL_NOTIFICATIONS_QUEUE } from "./notifications.constants";

function parseRedisPort(value?: string): number {
  const port = Number(value ?? "6379");

  if (Number.isNaN(port)) {
    return 6379;
  }

  return port;
}

@Injectable()
export class NotificationsPublisherService implements OnModuleDestroy {
  private readonly queue: Queue<NotificationEvent>;

  constructor(configService: ConfigService) {
    this.queue = new Queue<NotificationEvent>(EMAIL_NOTIFICATIONS_QUEUE, {
      connection: {
        host: configService.get<string>("REDIS_HOST", "redis"),
        port: parseRedisPort(configService.get<string>("REDIS_PORT")),
      },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 50,
        removeOnFail: 50,
      },
    });
  }

  async publishTaskAssigned(
    event: TaskAssignedNotificationEvent,
  ): Promise<Job<NotificationEvent>> {
    return this.queue.add("task-assigned", event);
  }

  async publishTaskStatusChanged(
    event: TaskStatusChangedNotificationEvent,
  ): Promise<Job<NotificationEvent>> {
    return this.queue.add("task-status-changed", event);
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }
}
