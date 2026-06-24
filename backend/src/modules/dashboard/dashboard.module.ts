import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TaskMovement } from '../tasks/entities/task-movement.entity';
import { Task } from '../tasks/entities/task.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskMovement])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
