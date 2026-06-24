# TaskFlow

TaskFlow e um MVP fullstack de gerenciamento de tarefas com autenticacao, Kanban, dashboard simples e notificacoes assincronas. O projeto segue o escopo definido em `SPEC.md` e a execucao incremental descrita em `PLAN.md`.

## Status do case

Etapas implementadas:

- backend NestJS com TypeORM, JWT, healthcheck e modulos por dominio;
- frontend Next.js com login, register, Kanban e dashboard;
- PostgreSQL, Redis, BullMQ e worker separado;
- Docker Compose, Dockerfiles multi-stage, Makefile e `.env.example`.

Implementado nesta entrega:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /users`
- `GET /health`
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `PATCH /tasks/:id/status`
- `GET /tasks/:id/movements`
- `GET /dashboard/summary`
- fila `email-notifications`
- worker com processamento separado e log simulando envio de e-mail
- frontend protegido com token salvo em `localStorage`
- Kanban com drag and drop via `dnd-kit`
- dashboard com filtros simples e graficos via `recharts`

Nao implementado:

- refresh token
- RBAC/permissoes avancadas
- upload de anexos
- WebSocket
- SMTP real
- dashboard avancado com comparativos mais ricos
- testes E2E extensos

## Stack

- Frontend: Next.js + React + TypeScript
- Backend: NestJS + TypeScript
- ORM: TypeORM
- Banco: PostgreSQL
- Fila: BullMQ
- Cache/infra de fila: Redis
- Infra local: Docker Compose

## Estrutura

```txt
taskflow/
  backend/
  frontend/
  docker-compose.yml
  Makefile
  README.md
  SPEC.md
  PLAN.md
  AGENTS.md
  .env.example
```

## Como executar com Docker

1. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Suba tudo:

```bash
docker compose up -d --build
```

3. Confira os servicos:

```bash
docker compose ps
```

Servicos esperados:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

## Como executar localmente

Requisito: manter PostgreSQL e Redis disponiveis. O caminho mais simples e subir so a infra com Docker:

```bash
cp .env.example .env
docker compose up -d postgres redis
```

Backend:

```bash
cd backend
npm install
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Worker:

```bash
cd backend
npm install
npm run start:worker
```

## Comandos uteis

```bash
make up
make down
make reset
make logs
make logs-api
make logs-worker
make ps
make build
make migrate
```

## Variaveis de ambiente

As variaveis base estao em `.env.example`.

Principais:

- `API_PORT`
- `FRONTEND_PORT`
- `FRONTEND_URL`
- `NEXT_PUBLIC_API_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `DATABASE_URL`
- `REDIS_HOST`
- `REDIS_PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Observacoes:

- `.env` nao deve ser commitado
- o repositorio nao contem secrets reais

## Endpoints principais

Health:

- `GET /health`

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

Users:

- `GET /users`

Tasks:

- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `PATCH /tasks/:id/status`
- `GET /tasks/:id/movements`

Dashboard:

- `GET /dashboard/summary`

## Payloads de exemplo

Register:

```json
{
  "name": "Gabriel Coimbra",
  "email": "gabriel@example.com",
  "password": "ChangeMe123!"
}
```

Login:

```json
{
  "email": "gabriel@example.com",
  "password": "ChangeMe123!"
}
```

Criar task:

```json
{
  "title": "Preparar quadro inicial",
  "description": "Criar as colunas padrao do Kanban",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-06-30T18:00:00.000Z",
  "tags": ["kanban", "mvp"],
  "assigneeId": "UUID_DO_USUARIO"
}
```

Atualizar status:

```json
{
  "status": "in_progress"
}
```

Dashboard com filtro:

```txt
GET /dashboard/summary?startDate=2026-06-01&endDate=2026-06-30
```

## Frontend

Rotas implementadas:

- `/login`
- `/register`
- `/kanban`
- `/dashboard`

Comportamento:

- `login` e `register` usam o backend real
- o token JWT fica em `localStorage`
- `/kanban` e `/dashboard` exigem sessao
- o Kanban lista tasks reais, cria, edita, exclui e move cards
- o dashboard consome `GET /dashboard/summary` e exibe dados reais

## Notificacoes assincronas

Fila:

- `email-notifications`

Eventos publicados pela API:

- criacao de task com `assigneeId`
- alteracao de `assigneeId`
- alteracao de status

Exemplo de log esperado no worker:

```txt
[EmailWorker][task_status_changed] Sending notification to user@email.com: Task "Preparar quadro inicial" changed status to in_progress
```

## Decisoes tecnicas

- TypeORM foi mantido para seguir o padrao do projeto de referencia e a estrutura pedida no case.
- PostgreSQL substitui SQL Server para alinhar com a especificacao.
- BullMQ + Redis substituem RabbitMQ e MongoDB para simplificar a fila.
- O backend foi dividido em modulos pequenos: `auth`, `users`, `tasks`, `dashboard`, `notifications`, `health`.
- O frontend usa App Router e uma camada minima de client de API, sem adicionar gerenciamento de estado mais pesado.
- O token foi salvo localmente para manter o fluxo simples e funcional no MVP.

## Trade-offs

- autenticacao sem refresh token
- sem permissoes avancadas
- delete fisico de tasks
- historico registrado apenas na rota de mudanca de status
- notificacao simulada por log em vez de SMTP real
- dashboard com agregacoes simples, sem comparativos complexos
- sem WebSocket; atualizacao e por reload ou nova consulta

## Validacao manual sugerida

1. Acesse `http://localhost:3000/register`
2. Crie um usuario
3. Confirme o redirecionamento para `/kanban`
4. Crie uma task
5. Edite a task
6. Arraste a task entre colunas
7. Recarregue a pagina para confirmar persistencia
8. Exclua a task
9. Acesse `/dashboard`
10. Confira os cards e os graficos
11. Aplique filtro por periodo
12. Veja os logs do worker com:

```bash
docker compose logs --tail=120 worker
```

## Melhorias futuras

- refresh token
- anexos
- dashboard com mais cortes analiticos
- testes automatizados mais amplos
- envio real de e-mail
- atualizacao em tempo real
