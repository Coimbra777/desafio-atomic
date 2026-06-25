/**
 * Seed de demonstração do TaskFlow.
 *
 * Idempotente: usuários são ignorados se o e-mail já existir;
 * tasks com a tag "seed" são deletadas e recriadas a cada execução.
 * Movimentações em cascade são deletadas junto com as tasks.
 *
 * Uso: npm run seed  (dentro do container: docker compose exec api npm run seed)
 */

import "reflect-metadata";
import * as bcrypt from "bcrypt";

import AppDataSource from "../data-source";
import { Task } from "../../modules/tasks/entities/task.entity";
import { TaskPriority } from "../../modules/tasks/task-priority.enum";
import { TaskStatus } from "../../modules/tasks/task-status.enum";
import { User } from "../../modules/users/entities/user.entity";

// ── Constants ────────────────────────────────────────────────────────────────

const SEED_PASSWORD = "Taskflow@123";
const SEED_TAG = "seed";
const BCRYPT_ROUNDS = 10;

// ── Date helpers ─────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysLater(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// ── User definitions ─────────────────────────────────────────────────────────

const USER_DEFS = [
  { name: "Gabriel", email: "gabriel@taskflow.dev" },
  { name: "Ana Souza", email: "ana@taskflow.dev" },
  { name: "Carlos Lima", email: "carlos@taskflow.dev" },
  { name: "Marina Costa", email: "marina@taskflow.dev" },
  { name: "João Pereira", email: "joao@taskflow.dev" },
] as const;

// ── Task definitions ──────────────────────────────────────────────────────────

type TaskDef = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  tags: string[];
  assigneeEmail: string | null;
  creatorEmail: string;
};

function buildTaskDefs(): TaskDef[] {
  return [
    // ── A Fazer (6) ─────────────────────────────────────────────────────────
    {
      title: "Criar tela de configurações do usuário",
      description:
        "Implementar página de perfil com edição de nome, e-mail e troca de senha. Incluir avatar placeholder.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: daysLater(30),
      tags: ["frontend", "ux"],
      assigneeEmail: "carlos@taskflow.dev",
      creatorEmail: "gabriel@taskflow.dev",
    },
    {
      title: "Integrar Slack para notificações de equipe",
      description:
        "Publicar mensagem no canal #tarefas quando uma task for criada ou movida para Concluído. Usar Incoming Webhooks.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: daysLater(14),
      tags: ["backend", "integration"],
      assigneeEmail: "ana@taskflow.dev",
      creatorEmail: "gabriel@taskflow.dev",
    },
    {
      title: "Revisar documentação da API REST",
      description:
        "Atualizar exemplos de payload no README e gerar especificação OpenAPI para os endpoints de tasks e dashboard.",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: daysLater(20),
      tags: ["docs"],
      assigneeEmail: "carlos@taskflow.dev",
      creatorEmail: "ana@taskflow.dev",
    },
    {
      title: "Criar relatório mensal de performance",
      description:
        "Gerar relatório em PDF com métricas do mês: tasks concluídas, taxa de atraso e distribuição por responsável.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: endOfToday(),
      tags: ["analytics"],
      assigneeEmail: "marina@taskflow.dev",
      creatorEmail: "marina@taskflow.dev",
    },
    {
      title: "Configurar pipeline de CI/CD",
      description:
        "Configurar GitHub Actions para lint, build e push automático das imagens Docker ao fazer merge na main.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: daysLater(10),
      tags: ["infra", "devops"],
      assigneeEmail: "joao@taskflow.dev",
      creatorEmail: "carlos@taskflow.dev",
    },
    {
      title: "Mapear requisitos do módulo de billing",
      description:
        "Levantar com stakeholders as regras de cobrança: planos, limites de tasks e integração com Stripe ou PagSeguro.",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: daysLater(45),
      tags: ["feature", "planning"],
      assigneeEmail: null,
      creatorEmail: "joao@taskflow.dev",
    },

    // ── Em Andamento (7) ─────────────────────────────────────────────────────
    {
      title: "Refatorar módulo de autenticação",
      description:
        "Extrair guards e strategies para arquivos separados. Adicionar suporte a token de refresh com rotação automática.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: endOfToday(),
      tags: ["backend", "refactor"],
      assigneeEmail: "gabriel@taskflow.dev",
      creatorEmail: "gabriel@taskflow.dev",
    },
    {
      title: "Implementar paginação nas listagens",
      description:
        "Adicionar paginação cursor-based no endpoint GET /tasks. Limitar a 25 itens por página e retornar metadados de cursor.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAgo(1),
      tags: ["backend", "feature"],
      assigneeEmail: "ana@taskflow.dev",
      creatorEmail: "ana@taskflow.dev",
    },
    {
      title: "Adaptar dashboard para telas mobile",
      description:
        "Os cards de métricas quebram em telas menores que 375px. Ajustar grid e remover gráfico de barras em viewports pequenos.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: daysAgo(5),
      tags: ["frontend", "ux"],
      assigneeEmail: "marina@taskflow.dev",
      creatorEmail: "carlos@taskflow.dev",
    },
    {
      title: "Otimizar queries lentas do banco de dados",
      description:
        "Adicionar índices em task.assignee_id e task.created_at. Analisar plano de execução com EXPLAIN ANALYZE.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: daysLater(3),
      tags: ["backend", "performance"],
      assigneeEmail: "carlos@taskflow.dev",
      creatorEmail: "marina@taskflow.dev",
    },
    {
      title: "Escrever testes unitários para o serviço de tasks",
      description:
        "Cobrir os casos de criação, atualização de status e regras de movimentação. Meta: 80% de cobertura no TasksService.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
      dueDate: daysLater(7),
      tags: ["testing"],
      assigneeEmail: "joao@taskflow.dev",
      creatorEmail: "joao@taskflow.dev",
    },
    {
      title: "Implementar exportação de tasks para CSV",
      description:
        "Adicionar endpoint GET /tasks/export que retorna um CSV com todas as tasks do usuário. Incluir filtros de status e período.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAgo(2),
      tags: ["backend", "feature"],
      assigneeEmail: "gabriel@taskflow.dev",
      creatorEmail: "gabriel@taskflow.dev",
    },
    {
      title: "Criar onboarding para novos usuários",
      description:
        "Fluxo de boas-vindas com 3 steps: criar primeira task, mover entre colunas e convidar colega. Exibir apenas no primeiro acesso.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: daysLater(14),
      tags: ["ux", "feature"],
      assigneeEmail: "ana@taskflow.dev",
      creatorEmail: "ana@taskflow.dev",
    },

    // ── Em Revisão (5) ───────────────────────────────────────────────────────
    {
      title: "Validar layout responsivo no Safari 17",
      description:
        "Testes de regressão visual no Safari 17 (macOS e iOS). Checar drag-and-drop do Kanban e alinhamento dos gráficos.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: daysAgo(3),
      tags: ["frontend", "qa"],
      assigneeEmail: "carlos@taskflow.dev",
      creatorEmail: "carlos@taskflow.dev",
    },
    {
      title: "Revisar PRs de integração com gateway de pagamentos",
      description:
        "Code review de 3 PRs: criação de planos, webhook de cobrança e portal do cliente. Checar tratamento de erros da API do Stripe.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: endOfToday(),
      tags: ["backend", "integration"],
      assigneeEmail: "marina@taskflow.dev",
      creatorEmail: "marina@taskflow.dev",
    },
    {
      title: "Testar fluxo de recuperação de senha",
      description:
        "Validar o fluxo completo de reset: envio do e-mail, validade do token (24h), nova senha e invalidação do token anterior.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.LOW,
      dueDate: daysLater(5),
      tags: ["qa", "security"],
      assigneeEmail: "joao@taskflow.dev",
      creatorEmail: "joao@taskflow.dev",
    },
    {
      title: "Auditar permissões e acessos da API",
      description:
        "Revisar guards de autenticação, testar rotas sem token e com token expirado. Garantir que nenhum endpoint retorne dados de outros usuários.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: daysAgo(7),
      tags: ["security", "backend"],
      assigneeEmail: "gabriel@taskflow.dev",
      creatorEmail: "gabriel@taskflow.dev",
    },
    {
      title: "Checar cobertura de testes E2E do Kanban",
      description:
        "Executar suite de testes E2E com Playwright: criar task, mover entre colunas, editar e excluir. Verificar persistência após reload.",
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: daysLater(7),
      tags: ["testing", "qa"],
      assigneeEmail: "ana@taskflow.dev",
      creatorEmail: "ana@taskflow.dev",
    },

    // ── Concluído (7) ────────────────────────────────────────────────────────
    {
      title: "Setup inicial do projeto",
      description:
        "Criar repositório monorepo, configurar ESLint, Prettier, tsconfig, Dockerfile multi-stage e docker-compose base.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: daysAgo(14),
      tags: ["infra"],
      assigneeEmail: "gabriel@taskflow.dev",
      creatorEmail: "gabriel@taskflow.dev",
    },
    {
      title: "Configurar Docker Compose completo",
      description:
        "Adicionar serviços postgres, redis, api, worker e frontend com healthchecks e depends_on. Incluir variáveis de ambiente via .env.",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAgo(12),
      tags: ["infra", "devops"],
      assigneeEmail: "carlos@taskflow.dev",
      creatorEmail: "gabriel@taskflow.dev",
    },
    {
      title: "Criar migrations do banco de dados",
      description:
        "Escrever migrations TypeORM para as tabelas users, tasks e task_movements. Validar rollback com migration:revert.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: daysAgo(10),
      tags: ["backend", "database"],
      assigneeEmail: "marina@taskflow.dev",
      creatorEmail: "gabriel@taskflow.dev",
    },
    {
      title: "Implementar autenticação JWT com NestJS",
      description:
        "Configurar módulo de auth com Passport.js e estratégia JWT. Implementar register, login e guard para rotas protegidas.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: daysAgo(8),
      tags: ["backend", "security"],
      assigneeEmail: "gabriel@taskflow.dev",
      creatorEmail: "gabriel@taskflow.dev",
    },
    {
      title: "Criar API CRUD de tarefas",
      description:
        "Implementar endpoints GET, POST, PATCH e DELETE para /tasks. Incluir endpoint de status e histórico de movimentações.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: daysAgo(8),
      tags: ["backend", "feature"],
      assigneeEmail: "joao@taskflow.dev",
      creatorEmail: "ana@taskflow.dev",
    },
    {
      title: "Desenvolver quadro Kanban com drag-and-drop",
      description:
        "Implementar Kanban no frontend com @dnd-kit. Colunas A Fazer, Em Andamento, Em Revisão e Concluído. Cards arrastáveis e clicáveis.",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAgo(5),
      tags: ["frontend", "feature"],
      assigneeEmail: "ana@taskflow.dev",
      creatorEmail: "carlos@taskflow.dev",
    },
    {
      title: "Implementar dashboard com gráficos analíticos",
      description:
        "Criar dashboard com recharts exibindo tasks por status, por responsável, conclusões por dia e contadores de totais e atrasos.",
      status: TaskStatus.DONE,
      priority: TaskPriority.MEDIUM,
      dueDate: daysAgo(3),
      tags: ["frontend", "analytics"],
      assigneeEmail: "marina@taskflow.dev",
      creatorEmail: "marina@taskflow.dev",
    },
  ];
}

// ── Movement helper ───────────────────────────────────────────────────────────

async function insertMovement(
  taskId: string,
  fromStatus: TaskStatus | null,
  toStatus: TaskStatus,
  movedById: string,
  createdAt: Date,
): Promise<void> {
  await AppDataSource.query(
    `INSERT INTO task_movements (id, task_id, from_status, to_status, moved_by, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
    [taskId, fromStatus, toStatus, movedById, createdAt],
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("Connecting to the database…");
  await AppDataSource.initialize();
  console.log("Connected.\n");

  try {
    // ── 1. Upsert users ─────────────────────────────────────────────────────

    console.log("=== Users ===");
    const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);
    const userRepo = AppDataSource.getRepository(User);
    const userMap: Record<string, User> = {};

    for (const def of USER_DEFS) {
      let user = await userRepo.findOne({ where: { email: def.email } });

      if (!user) {
        user = userRepo.create({
          name: def.name,
          email: def.email,
          passwordHash,
        });
        await userRepo.save(user);
        console.log(`  [CREATED] ${def.email}`);
      } else {
        console.log(`  [SKIPPED] ${def.email} (already exists)`);
      }

      userMap[def.email] = user;
    }

    const gabriel = userMap["gabriel@taskflow.dev"];
    const ana = userMap["ana@taskflow.dev"];
    const carlos = userMap["carlos@taskflow.dev"];
    const marina = userMap["marina@taskflow.dev"];
    const joao = userMap["joao@taskflow.dev"];

    // ── 2. Delete existing seed tasks (movements cascade) ───────────────────

    console.log("\n=== Tasks ===");
    const taskRepo = AppDataSource.getRepository(Task);

    await AppDataSource.query(
      `DELETE FROM tasks WHERE tags ~ '(^|,)${SEED_TAG}(,|$)'`,
    );
    console.log("  Cleaned up previous seed tasks.");

    // ── 3. Create tasks ──────────────────────────────────────────────────────

    const taskDefs = buildTaskDefs();
    const createdTasks: Task[] = [];

    for (const def of taskDefs) {
      const assignee = def.assigneeEmail ? userMap[def.assigneeEmail] : null;
      const creator = userMap[def.creatorEmail];

      const task = taskRepo.create({
        title: def.title,
        description: def.description,
        status: def.status,
        priority: def.priority,
        dueDate: def.dueDate,
        tags: [...def.tags, SEED_TAG],
        assigneeId: assignee?.id ?? null,
        createdById: creator.id,
      });

      await taskRepo.save(task);
      createdTasks.push(task);
    }

    console.log(`  Created ${createdTasks.length} tasks.`);

    // ── 4. Create movements ──────────────────────────────────────────────────
    //
    // Tasks indexed by their position in the taskDefs array (0-based):
    //   [0..5]   = TODO        → no movements
    //   [6..12]  = IN_PROGRESS → 1 movement each  (todo → in_progress)
    //   [13..17] = IN_REVIEW   → 2 movements each (todo → in_progress → in_review)
    //   [18..24] = DONE        → 3 movements each (todo → in_progress → in_review → done)
    //
    // Movements for DONE tasks use past timestamps so the "completions by day"
    // chart on the dashboard shows a realistic spread over the last two weeks.

    console.log("\n=== Movements ===");

    // IN_PROGRESS tasks (indices 6–12) — 1 movement each
    const inProgressMovers = [gabriel, ana, marina, carlos, joao, gabriel, ana];
    for (let i = 0; i < 7; i++) {
      const task = createdTasks[6 + i];
      const mover = inProgressMovers[i];
      await insertMovement(
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
        task.id,
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        mover.id,
        daysAgo(8 + i),
      );
      await insertMovement(
        task.id,
        TaskStatus.IN_PROGRESS,
        TaskStatus.IN_REVIEW,
        mover.id,
        daysAgo(4 + i),
      );
    }

    // DONE tasks (indices 18–24) — 3 movements each
    const doneMovers = [gabriel, carlos, marina, gabriel, joao, ana, marina];
    const doneCompletionDays = [13, 11, 9, 7, 7, 4, 2]; // days ago each was completed

    for (let i = 0; i < 7; i++) {
      const task = createdTasks[18 + i];
      const mover = doneMovers[i];
      const completedDaysAgo = doneCompletionDays[i];

      await insertMovement(
        task.id,
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        mover.id,
        daysAgo(completedDaysAgo + 6),
      );
      await insertMovement(
        task.id,
        TaskStatus.IN_PROGRESS,
        TaskStatus.IN_REVIEW,
        mover.id,
        daysAgo(completedDaysAgo + 2),
      );
      await insertMovement(
        task.id,
        TaskStatus.IN_REVIEW,
        TaskStatus.DONE,
        mover.id,
        daysAgo(completedDaysAgo),
      );
    }

    const totalMovements = 7 * 1 + 5 * 2 + 7 * 3;
    console.log(`  Created ${totalMovements} movements.`);

    // ── Summary ──────────────────────────────────────────────────────────────

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
