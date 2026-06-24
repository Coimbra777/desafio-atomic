import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { TaskStatus } from '../task-status.enum';
import { Task } from './task.entity';

@Entity('task_movements')
export class TaskMovement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId!: string;

  @ManyToOne(() => Task, (task) => task.movements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task!: Task;

  @Column({ name: 'from_status', type: 'enum', enum: TaskStatus, nullable: true })
  fromStatus!: TaskStatus | null;

  @Column({ name: 'to_status', type: 'enum', enum: TaskStatus })
  toStatus!: TaskStatus;

  @Column({ name: 'moved_by', type: 'uuid' })
  movedById!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'moved_by' })
  movedBy!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

