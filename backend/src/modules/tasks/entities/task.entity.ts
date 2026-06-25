import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "../../users/entities/user.entity";
import { TaskPriority } from "../task-priority.enum";
import { TaskStatus } from "../task-status.enum";
import { TaskMovement } from "./task-movement.entity";

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 160 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({ name: "due_date", type: "timestamp", nullable: true })
  dueDate!: Date | null;

  @Column({ type: "simple-array", default: "" })
  tags!: string[];

  @Column({ name: "assignee_id", type: "uuid", nullable: true })
  assigneeId!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "assignee_id" })
  assignee!: User | null;

  @Column({ name: "created_by", type: "uuid" })
  createdById!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "created_by" })
  creator!: User;

  @OneToMany(() => TaskMovement, (movement) => movement.task)
  movements!: TaskMovement[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
