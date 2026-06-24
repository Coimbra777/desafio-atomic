import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTables1761243600000 implements MigrationInterface {
  name = 'CreateTasksTables1761243600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."tasks_status_enum" AS ENUM(
        'todo',
        'in_progress',
        'in_review',
        'done'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."tasks_priority_enum" AS ENUM(
        'low',
        'medium',
        'high'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."task_movements_from_status_enum" AS ENUM(
        'todo',
        'in_progress',
        'in_review',
        'done'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."task_movements_to_status_enum" AS ENUM(
        'todo',
        'in_progress',
        'in_review',
        'done'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying(160) NOT NULL,
        "description" text,
        "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'todo',
        "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium',
        "due_date" TIMESTAMP,
        "tags" text NOT NULL DEFAULT '',
        "assignee_id" uuid,
        "created_by" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "pk_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_tasks_assignee_id" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT "fk_tasks_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "task_movements" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "task_id" uuid NOT NULL,
        "from_status" "public"."task_movements_from_status_enum",
        "to_status" "public"."task_movements_to_status_enum" NOT NULL,
        "moved_by" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "pk_task_movements_id" PRIMARY KEY ("id"),
        CONSTRAINT "fk_task_movements_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "fk_task_movements_moved_by" FOREIGN KEY ("moved_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "task_movements"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."task_movements_to_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."task_movements_from_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
  }
}

