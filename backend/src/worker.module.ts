import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { NotificationsModule } from './modules/notifications/notifications.module';
import { NotificationsWorkerService } from './modules/notifications/notifications-worker.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    NotificationsModule,
  ],
  providers: [NotificationsWorkerService],
})
export class WorkerModule {}

