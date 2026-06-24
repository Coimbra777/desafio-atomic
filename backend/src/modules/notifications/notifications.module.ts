import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { NotificationsProcessor } from './notifications.processor';
import { NotificationsPublisherService } from './notifications-publisher.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [NotificationsPublisherService, NotificationsProcessor],
  exports: [NotificationsPublisherService, NotificationsProcessor],
})
export class NotificationsModule {}

