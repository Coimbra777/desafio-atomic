import { DataSource } from "typeorm";

import { Task } from "../../modules/tasks/entities/task.entity";
import { TaskStatus } from "../../modules/tasks/task-status.enum";
import { User } from "../../modules/users/entities/user.entity";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function insertMovement(
  dataSource: DataSource,
  taskId: string,
  fromStatus: TaskStatus | null,
  toStatus: TaskStatus,
  movedById: string,
  createdAt: Date,
): Promise<void> {
  await dataSource.query(
    `INSERT INTO task_movements (id, task_id, from_status, to_status, moved_by, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
    [taskId, fromStatus, toStatus, movedById, createdAt],
  );
}

/**
 * Inserts historical movements for tasks seeded by seedTasks.
 *
 * Expected task layout (by index):
 *   [0..5]   TODO         → no movements
 *   [6..12]  IN_PROGRESS  → 1 movement each  (todo → in_progress)
 *   [13..17] IN_REVIEW    → 2 movements each (todo → in_progress → in_review)
 *   [18..24] DONE         → 3 movements each (todo → in_progress → in_review → done)
 *
 * DONE tasks use past timestamps spread over 13 days so the dashboard
 * "completions by day" chart shows a realistic spread.
 */
export async function seedMovements(
  dataSource: DataSource,
  createdTasks: Task[],
  userMap: Record<string, User>,
): Promise<number> {
  const gabriel = userMap["gabriel@taskflow.dev"];
  const ana = userMap["ana@taskflow.dev"];
  const carlos = userMap["carlos@taskflow.dev"];
  const marina = userMap["marina@taskflow.dev"];
  const joao = userMap["joao@taskflow.dev"];

  // IN_PROGRESS tasks (indices 6–12) — 1 movement each
  const inProgressMovers = [gabriel, ana, marina, carlos, joao, gabriel, ana];
  for (let i = 0; i < 7; i++) {
    const task = createdTasks[6 + i];
    const mover = inProgressMovers[i];
    await insertMovement(
      dataSource,
      task.id,
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      mover.id,
      daysAgo(3 + i),
    );
  }

  // IN_REVIEW tasks (indices 13–17) — 2 movements each
  const reviewMovers = [carlos, marina, joao, gabriel, ana];
  for (let i = 0; i < 5; i++) {
    const task = createdTasks[13 + i];
    const mover = reviewMovers[i];
    await insertMovement(
      dataSource,
      task.id,
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      mover.id,
      daysAgo(8 + i),
    );
    await insertMovement(
      dataSource,
      task.id,
      TaskStatus.IN_PROGRESS,
      TaskStatus.IN_REVIEW,
      mover.id,
      daysAgo(4 + i),
    );
  }

  // DONE tasks (indices 18–24) — 3 movements each
  const doneMovers = [gabriel, carlos, marina, gabriel, joao, ana, marina];
  const doneCompletionDays = [13, 11, 9, 7, 7, 4, 2];

  for (let i = 0; i < 7; i++) {
    const task = createdTasks[18 + i];
    const mover = doneMovers[i];
    const completedDaysAgo = doneCompletionDays[i];

    await insertMovement(
      dataSource,
      task.id,
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      mover.id,
      daysAgo(completedDaysAgo + 6),
    );
    await insertMovement(
      dataSource,
      task.id,
      TaskStatus.IN_PROGRESS,
      TaskStatus.IN_REVIEW,
      mover.id,
      daysAgo(completedDaysAgo + 2),
    );
    await insertMovement(
      dataSource,
      task.id,
      TaskStatus.IN_REVIEW,
      TaskStatus.DONE,
      mover.id,
      daysAgo(completedDaysAgo),
    );
  }

  const total = 7 * 1 + 5 * 2 + 7 * 3;
  console.log(`  Created ${total} movements.`);
  return total;
}
