/**
 * Seed de demonstração do TaskFlow — arquivo orquestrador.
 *
 * Executa os seeds de usuários, tasks e movimentações em ordem.
 * Idempotente: usuários são ignorados se já existem; tasks com a tag "seed"
 * são deletadas e recriadas a cada execução.
 *
 * Uso: npm run seed
 *      docker compose exec api npm run seed
 */

import "reflect-metadata";

import { TaskStatus } from "../../modules/tasks/task-status.enum";
import AppDataSource from "../data-source";
import { seedMovements } from "./seed-movements";
import { SEED_PASSWORD, USER_DEFS, seedUsers } from "./seed-users";
import { seedTasks } from "./seed-tasks";

async function main(): Promise<void> {
  console.log("Connecting to the database…");
  await AppDataSource.initialize();
  console.log("Connected.\n");

  try {
    console.log("=== Users ===");
    const userMap = await seedUsers(AppDataSource);

    console.log("\n=== Tasks ===");
    const createdTasks = await seedTasks(AppDataSource, userMap);

    console.log("\n=== Movements ===");
    const totalMovements = await seedMovements(AppDataSource, createdTasks, userMap);

    console.log("\n=== Summary ===");
    console.log(`  Users    : ${USER_DEFS.length}`);
    console.log(`  Tasks    : ${createdTasks.length}`);
    console.log(
      `    todo        : ${createdTasks.filter((t) => t.status === TaskStatus.TODO).length}`,
    );
    console.log(
      `    in_progress : ${createdTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length}`,
    );
    console.log(
      `    in_review   : ${createdTasks.filter((t) => t.status === TaskStatus.IN_REVIEW).length}`,
    );
    console.log(
      `    done        : ${createdTasks.filter((t) => t.status === TaskStatus.DONE).length}`,
    );
    console.log(`  Movements: ${totalMovements}`);
    console.log(`\n  Login: gabriel@taskflow.dev / ${SEED_PASSWORD}`);
    console.log("\nSeed completed successfully.");
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exitCode = 1;
});
