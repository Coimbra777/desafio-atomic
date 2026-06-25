import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Job } from "bullmq";

import {
  NotificationEvent,
  TaskAssignedNotificationEvent,
  TaskDueSoonNotificationEvent,
  TaskStatusChangedNotificationEvent,
} from "./notification-event.type";

type MailtrapRecipient = { email: string };

type MailtrapPayload = {
  from: { email: string; name: string };
  to: MailtrapRecipient[];
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class NotificationsProcessor {
  private readonly apiToken: string | null;
  private readonly apiUrl: string;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>("MAILTRAP_API_TOKEN");
    const url = this.configService.get<string>("MAILTRAP_API_URL");

    if (token && url) {
      this.apiToken = token;
      this.apiUrl = url;
      this.fromEmail =
        this.configService.get<string>("MAIL_FROM_ADDRESS") ??
        "noreply@taskflow.dev";
      this.fromName =
        this.configService.get<string>("MAIL_FROM_NAME") ?? "TaskFlow";
    } else {
      this.apiToken = null;
      this.apiUrl = "";
      this.fromEmail = "";
      this.fromName = "";
    }
  }

  async process(job: Job<NotificationEvent>): Promise<void> {
    const event = job.data;

    if (event.type === "task-assigned") {
      if (this.apiToken) {
        await this.sendTaskAssigned(event);
      } else {
        console.log(
          `[EmailWorker][task_assigned] Sending notification to ${event.recipientEmail}: Task "${event.taskTitle}" was assigned to ${event.recipientName} by ${event.assignedByEmail}`,
        );
      }
      return;
    }

    if (event.type === "task-status-changed") {
      if (this.apiToken) {
        await this.sendTaskStatusChanged(event);
      } else {
        console.log(
          `[EmailWorker][task_status_changed] Sending notification to ${event.recipientEmail}: Task "${event.taskTitle}" changed status to ${event.currentStatus}`,
        );
      }
      return;
    }

    if (event.type === "task-due-soon") {
      if (this.apiToken) {
        await this.sendTaskDueSoon(event);
      } else {
        console.log(
          `[EmailWorker][task_due_soon] Sending notification to ${event.recipientEmail}: Task "${event.taskTitle}" is due on ${event.dueDate}`,
        );
      }
    }
  }

  private async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ): Promise<void> {
    const payload: MailtrapPayload = {
      from: { email: this.fromEmail, name: this.fromName },
      to: [{ email: to }],
      subject,
      text,
      html,
    };

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Mailtrap API error ${response.status}: ${body}`);
    }
  }

  private async sendTaskAssigned(
    event: TaskAssignedNotificationEvent,
  ): Promise<void> {
    const subject = `Nova tarefa atribuída: ${event.taskTitle}`;
    const text =
      `Olá, ${event.recipientName}!\n\n` +
      `A tarefa "${event.taskTitle}" (ID: ${event.taskId}) foi atribuída a você por ${event.assignedByEmail}.\n\n` +
      `TaskFlow`;
    const html =
      `<p>Olá, <strong>${event.recipientName}</strong>!</p>` +
      `<p>A tarefa <strong>${event.taskTitle}</strong> (ID: <code>${event.taskId}</code>) ` +
      `foi atribuída a você por <strong>${event.assignedByEmail}</strong>.</p>` +
      `<p>TaskFlow</p>`;

    await this.sendMail(event.recipientEmail, subject, text, html);
    console.log(
      `[EmailWorker][mail_sent] task-assigned → ${event.recipientEmail}`,
    );
  }

  private async sendTaskStatusChanged(
    event: TaskStatusChangedNotificationEvent,
  ): Promise<void> {
    const prev = event.previousStatus ?? "—";
    const subject = `Status atualizado: ${event.taskTitle}`;
    const text =
      `Olá, ${event.recipientName}!\n\n` +
      `A tarefa "${event.taskTitle}" (ID: ${event.taskId}) teve seu status alterado ` +
      `de "${prev}" para "${event.currentStatus}".\n\n` +
      `TaskFlow`;
    const html =
      `<p>Olá, <strong>${event.recipientName}</strong>!</p>` +
      `<p>A tarefa <strong>${event.taskTitle}</strong> (ID: <code>${event.taskId}</code>) ` +
      `teve seu status alterado de <strong>${prev}</strong> para <strong>${event.currentStatus}</strong>.</p>` +
      `<p>TaskFlow</p>`;

    await this.sendMail(event.recipientEmail, subject, text, html);
    console.log(
      `[EmailWorker][mail_sent] task-status-changed → ${event.recipientEmail}`,
    );
  }

  private async sendTaskDueSoon(
    event: TaskDueSoonNotificationEvent,
  ): Promise<void> {
    const subject = `Tarefa próxima do vencimento: ${event.taskTitle}`;
    const text =
      `Olá, ${event.recipientName}!\n\n` +
      `A tarefa "${event.taskTitle}" (ID: ${event.taskId}) vence em ${event.dueDate}.\n\n` +
      `TaskFlow`;
    const html =
      `<p>Olá, <strong>${event.recipientName}</strong>!</p>` +
      `<p>A tarefa <strong>${event.taskTitle}</strong> (ID: <code>${event.taskId}</code>) ` +
      `vence em <strong>${event.dueDate}</strong>.</p>` +
      `<p>TaskFlow</p>`;

    await this.sendMail(event.recipientEmail, subject, text, html);
    console.log(
      `[EmailWorker][mail_sent] task-due-soon → ${event.recipientEmail}`,
    );
  }
}
