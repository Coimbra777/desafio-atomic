/**
 * Script de verificação de vencimento próximo.
 *
 * Busca tasks não concluídas com dueDate nas próximas 24 horas e publica
 * um job `task-due-soon` na fila email-notifications para cada uma.
 *
 * Idempotência: o jobId é determinístico (`task-due-soon:<taskId>:<yyyy-mm-dd>`),
 * então reexecutar o script no mesmo dia não duplica notificações — o BullMQ
 * ignora silenciosamente jobs com o mesmo jobId já enfileirados ou concluídos.
 *
 * Uso:
 *   npm run notify:due-soon
 *   docker compose exec api npm run notify:due-soon
 */

import "reflect-metadata";

import { config as loadEnv } from "dotenv";
import { Between, Not } from "typeorm";

import AppDataSource from "../database/data-source";
import { Task } from "../modules/tasks/entities/task.entity";
import { TaskStatus } from "../modules/tasks/task-status.enum";
import { NotificationsPublisherService } from "../modules/notifications/notifications-publisher.service";
import { ConfigService } from "@nestjs/config";

loadEnv();

async function main(): Promise<void> {
  console.log("Connecting to the database…");
  await AppDataSource.initialize();
  console.log("Connected.\n");

  const configService = new ConfigService(
    process.env as Record<string, string>,
  );
  const publisher = new NotificationsPublisherService(configService);

  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcoming = await AppDataSource.getRepository(Task).find({
      where: {
        dueDate: Between(now, in24h),
        status: Not(TaskStatus.DONE),
      },
      relations: ["assignee", "creator"],
    });

    console.log(`Tasks vencendo nas próximas 24h: ${upcoming.length}`);

    let enqueued = 0;
    for (const task of upcoming) {
      const recipient = task.assignee ?? task.creator;
      const dueDate = (task.dueDate as Date).toISOString().slice(0, 10);

      await publisher.publishTaskDueSoon({
        type: "task-due-soon",
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        taskId: task.id,
        taskTitle: task.title,
        dueDate,
      });

      console.log(
        `  → Enqueued: "${task.title}" → ${recipient.email} (vence ${dueDate})`,
      );
      enqueued++;
    }

    console.log(`\nJobs enfileirados: ${enqueued}`);
  } finally {
    await publisher.onModuleDestroy();
    await AppDataSource.destroy();
  }
}

main().catch((err: unknown) => {
  console.error("notify:due-soon failed:", err);
  process.exitCode = 1;
});
