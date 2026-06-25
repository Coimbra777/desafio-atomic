import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Job, Worker } from "bullmq";

import { NotificationEvent } from "./notification-event.type";
import { EMAIL_NOTIFICATIONS_QUEUE } from "./notifications.constants";
import { NotificationsProcessor } from "./notifications.processor";

function parseRedisPort(value?: string): number {
  const port = Number(value ?? "6379");

  if (Number.isNaN(port)) {
    return 6379;
  }

  return port;
}

@Injectable()
export class NotificationsWorkerService
  implements OnModuleInit, OnModuleDestroy
{
  private worker: Worker<NotificationEvent> | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsProcessor: NotificationsProcessor,
  ) {}

  onModuleInit(): void {
    this.worker = new Worker<NotificationEvent>(
      EMAIL_NOTIFICATIONS_QUEUE,
      (job: Job<NotificationEvent>) => this.notificationsProcessor.process(job),
      {
        connection: {
          host: this.configService.get<string>("REDIS_HOST", "redis"),
          port: parseRedisPort(this.configService.get<string>("REDIS_PORT")),
        },
      },
    );

    this.worker.on("completed", (job) => {
      console.log(`[EmailWorker] Job ${job.id} completed.`);
    });

    this.worker.on("failed", (job, error) => {
      console.error(
        `[EmailWorker] Job ${job?.id ?? "unknown"} failed: ${error.message}`,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
