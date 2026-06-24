import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

import { NotificationEvent } from './notification-event.type';

@Injectable()
export class NotificationsProcessor {
  async process(job: Job<NotificationEvent>): Promise<void> {
    const event = job.data;

    if (event.type === 'task-assigned') {
      console.log(
        `[EmailWorker][task_assigned] Sending notification to ${event.recipientEmail}: Task "${event.taskTitle}" was assigned to ${event.recipientName} by ${event.assignedByEmail}`,
      );

      return;
    }

    console.log(
      `[EmailWorker][task_status_changed] Sending notification to ${event.recipientEmail}: Task "${event.taskTitle}" changed status to ${event.currentStatus}`,
    );
  }
}
