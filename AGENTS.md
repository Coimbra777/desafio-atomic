# AGENTS.md — Instruções para Codex

## Contexto do projeto

Este repositório contém o case técnico **TaskFlow**.

O projeto é um MVP fullstack de gerenciamento de tarefas com Kanban, autenticação, dashboard analítico simples e notificações assíncronas via fila.

A avaliação busca validar linha de raciocínio, organização, priorização e capacidade de entregar uma solução simples e funcional.

Não criar uma solução excessivamente robusta.

## Documentos de referência

Antes de implementar qualquer alteração, leia:

- `SPEC.md`
- `PLAN.md`
- `AGENTS.md`
- `README.md`, se existir

A implementação deve seguir o escopo definido na `SPEC.md`.

A ordem de execução deve seguir o `PLAN.md`.

## Padrão técnico adotado

Este projeto deve seguir o padrão do zip de referência analisado, com adaptações ao novo case.

Padrões que devem ser preservados:

- NestJS modular;
- TypeORM;
- entidades por módulo;
- DTOs por módulo;
- migrations explícitas;
- `src/database/data-source.ts`;
- `src/database/migrations`;
- `src/database/seeds/seed.ts`, se houver seed;
- `ConfigModule` global;
- `ValidationPipe` global;
- Dockerfile multi-stage;
- Docker Compose;
- Makefile;
- `.env.example`;
- README detalhado.

O backend deve permanecer baseado em TypeORM.
Nao migrar para Prisma.
Persistir o padrao com `entities` por modulo, `migrations` explicitas e `src/database/data-source.ts`.

Adaptações obrigatórias:

- usar PostgreSQL, não SQL Server;
- usar BullMQ + Redis, não RabbitMQ;
- não usar MongoDB;
- adicionar frontend Next.js;
- manter escopo simples.

## Stack obrigatória

- Frontend: Next.js + React + TypeScript
- Backend: NestJS + TypeScript
- ORM: TypeORM
- Banco de dados: PostgreSQL
- Fila: BullMQ
- Redis
- Docker Compose

## Estrutura esperada

```txt
taskflow/
  frontend/
  backend/
  docker-compose.yml
  Makefile
  README.md
  SPEC.md
  PLAN.md
  AGENTS.md
  .env.example
```

Backend:

```txt
backend/
  src/
    app.module.ts
    main.ts
    database/
      data-source.ts
      migrations/
      seeds/
    modules/
      auth/
      users/
      tasks/
      dashboard/
      notifications/
      health/
  Dockerfile
  package.json
```

Frontend:

```txt
frontend/
  src/
    app/
      login/
      register/
      kanban/
      dashboard/
    components/
      kanban/
      dashboard/
      forms/
      ui/
    lib/
    types/
  Dockerfile
  package.json
```

## Princípios gerais

- Priorizar simplicidade.
- Não adicionar features fora da especificação.
- Não criar arquitetura complexa.
- Não implementar funcionalidades opcionais sem necessidade.
- Não quebrar funcionalidades já implementadas.
- Fazer mudanças pequenas e coesas.
- Manter o projeto fácil de executar localmente.
- Atualizar README quando criar ou alterar comandos, variáveis ou decisões relevantes.

## O que NÃO implementar

Não implementar nesta versão:

- upload de anexos;
- refresh token;
- RBAC avançado;
- permissões por workspace;
- multi-tenant;
- WebSocket;
- CI/CD;
- deploy em cloud;
- envio real de e-mail via SMTP;
- design system complexo;
- testes E2E extensos;
- microserviços;
- RabbitMQ;
- MongoDB.

Se alguma dessas funcionalidades parecer necessária, documente como melhoria futura em vez de implementar.

## Convenções de código

- Usar TypeScript.
- Evitar `any`.
- Usar nomes claros.
- Preferir código explícito a abstrações genéricas demais.
- Manter controllers simples.
- Colocar regras de negócio nos services.
- Validar entradas no backend com DTOs.
- Validar formulários no frontend.
- Tratar erros de forma simples e clara.
- Não commitar secrets.
- Não retornar `passwordHash` em respostas da API.

## Backend — NestJS

### Estrutura dos módulos

Cada módulo principal deve seguir este formato:

```txt
src/modules/<module>/
  dto/
  entities/
  <module>.controller.ts
  <module>.service.ts
  <module>.module.ts
```

Nem todo módulo precisa de `entities/`. Exemplo: `auth` normalmente não precisa.

### Regras

- Usar NestJS modular.
- Criar módulos por domínio.
- Controllers devem apenas receber requisição e delegar para services.
- Services devem conter regras de negócio.
- Usar TypeORM repositories.
- Usar `@InjectRepository`.
- Usar migrations explícitas.
- Usar `ValidationPipe` global.
- Usar `class-validator` e `class-transformer` nos DTOs.
- Usar `bcrypt` para hash de senha.
- Usar JWT para autenticação.
- Proteger rotas privadas com `JwtAuthGuard`.
- Usar Helmet.
- Configurar CORS para permitir frontend local.

### Configuração global esperada

`main.ts` deve usar:

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
);
```

### Rotas mínimas

Health:

```txt
GET /health
```

Auth:

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
```

Users:

```txt
GET /users
```

Tasks:

```txt
GET    /tasks
POST   /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id
PATCH  /tasks/:id/status
```

Dashboard:

```txt
GET /dashboard/summary
```

## Banco de dados

Usar TypeORM com PostgreSQL.

Modelos esperados:

- `User`
- `Task`
- `TaskMovement`

Enums esperados:

- `TaskStatus`
- `TaskPriority`

Status internos:

```txt
todo
in_progress
in_review
done
```

Prioridades internas:

```txt
low
medium
high
```

### Entidade User

Campos esperados:

```txt
id
name
email
passwordHash
createdAt
updatedAt
```

Tabela:

```txt
users
```

Colunas em snake_case:

```txt
password_hash
created_at
updated_at
```

### Entidade Task

Campos esperados:

```txt
id
title
description
status
priority
dueDate
tags
assigneeId
assignee
createdBy
creator
movements
createdAt
updatedAt
```

Tabela:

```txt
tasks
```

Colunas em snake_case:

```txt
due_date
assignee_id
created_by
created_at
updated_at
```

### Entidade TaskMovement

Campos esperados:

```txt
id
taskId
task
fromStatus
toStatus
movedBy
user
createdAt
```

Tabela:

```txt
task_movements
```

Colunas em snake_case:

```txt
task_id
from_status
to_status
moved_by
created_at
```

## DTOs

DTOs devem usar validação e transformações simples.

Exemplo de padrão:

```ts
@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
@IsString()
@IsNotEmpty()
title!: string;
```

E-mail deve ser normalizado:

```ts
@Transform(({ value }) =>
  typeof value === "string" ? value.trim().toLowerCase() : value,
)
@IsEmail()
email!: string;
```

## Fila e worker

Usar BullMQ com Redis.

Fila:

```txt
email-notifications
```

Eventos que geram job:

- card atribuído a um responsável;
- status do card alterado.

O worker deve ser separado da API.

O envio de e-mail deve ser simulado via log.

Não configurar SMTP real.

Exemplo de log:

```txt
[EmailWorker] Sending notification to user@email.com: Task "Título" changed status to done
```

### Padrão do módulo de notificações

Usar um padrão parecido com o módulo de auditoria do projeto de referência, porém com BullMQ:

```txt
src/modules/notifications/
  notification-event.type.ts
  notifications.module.ts
  notifications-publisher.service.ts
  notifications.processor.ts
```

A API deve chamar apenas o publisher.

O controller de tasks não deve conhecer detalhes da fila.

## Frontend — Next.js + React

### Regras

- Usar Next.js App Router.
- Usar TypeScript.
- Usar Tailwind, se estiver configurado.
- Usar componentes simples.
- Usar Client Components apenas onde houver interação.
- Usar `dnd-kit` para drag and drop.
- Usar React Hook Form e Zod para formulários, se configurados.
- Usar Recharts ou solução simples para gráficos.
- Não criar design system robusto.

### Páginas mínimas

```txt
/login
/register
/kanban
/dashboard
```

### Kanban

O Kanban deve ter colunas:

- A Fazer
- Em Andamento
- Em Revisão
- Concluído

O usuário deve conseguir:

- visualizar cards;
- criar card;
- editar card;
- excluir card;
- mover card entre colunas;
- persistir status no backend;
- abrir modal e visualizar histórico de movimentações.

O drag and drop é indispensável para o case.

## Docker

O projeto deve subir com:

```bash
docker compose up --build
```

Ou:

```bash
make setup
```

Serviços esperados:

```txt
frontend
api
worker
postgres
redis
```

URLs esperadas:

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:3001
Postgres: localhost:5432
Redis:    localhost:6379
```

## Makefile

Criar comandos úteis inspirados no projeto de referência:

```makefile
up:
	docker compose up -d --build

down:
	docker compose down

reset:
	docker compose down -v

logs:
	docker compose logs -f api

ps:
	docker compose ps

migrate:
	docker compose exec api npm run migration:run

seed:
	docker compose exec api npm run seed

setup: up migrate seed

build:
	docker compose exec api npm run build

test:
	docker compose exec api npm run test
```

Ajustar comandos conforme a estrutura real criada.

## Variáveis de ambiente

Criar e manter `.env.example`.

Variáveis sugeridas:

```txt
NODE_ENV=development

API_PORT=3001
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000

DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=taskflow
DB_PASSWORD=taskflow
DB_DATABASE=taskflow

DATABASE_URL=postgres://taskflow:taskflow@postgres:5432/taskflow

REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=change-me-jwt-secret
JWT_EXPIRES_IN=1d

NEXT_PUBLIC_API_URL=http://localhost:3001

SEED_USER_EMAIL=admin@example.com
SEED_USER_PASSWORD=ChangeMe123!
```

Não commitar `.env` real.

## README

Manter o README atualizado com:

- descrição do projeto;
- stack;
- funcionalidades;
- pré-requisitos;
- como executar com Docker;
- como executar localmente;
- variáveis de ambiente;
- endpoints principais;
- decisões técnicas;
- trade-offs;
- melhorias futuras.

## Trade-offs esperados

Documentar no README:

- upload de anexos não implementado porque é opcional no case;
- envio de e-mail real não implementado para evitar dependência de SMTP;
- refresh token não implementado para manter escopo simples;
- WebSocket não implementado porque não é necessário para o MVP;
- dashboard mantido simples para priorizar o fluxo principal;
- TypeORM usado para manter consistência com o projeto de referência.

## Commits

Usar mensagens semânticas:

```txt
chore: setup initial project structure
feat: setup nestjs backend base
feat: implement jwt authentication
feat: implement task management api
feat: add async notification worker
feat: setup frontend authentication
feat: implement kanban board
feat: add analytics dashboard
docs: improve project documentation
fix: correct task status update
refactor: simplify task service
```

## Critérios de aceite final

O projeto deve permitir:

- cadastrar usuário;
- fazer login;
- acessar rotas protegidas;
- criar card;
- editar card;
- excluir card;
- mover card entre colunas;
- atualizar status no backend;
- visualizar histórico de movimentação;
- visualizar dashboard simples;
- processar notificação no worker;
- rodar com Docker Compose;
- entender decisões técnicas pelo README.

## Comportamento esperado do Codex

Ao receber uma tarefa:

1. Leia `SPEC.md`, `PLAN.md` e `AGENTS.md`.
2. Identifique a etapa solicitada.
3. Implemente apenas o escopo da etapa.
4. Não adicione funcionalidades fora do escopo.
5. Atualize documentação quando necessário.
6. Mantenha o projeto simples e executável.
7. Ao finalizar, informe quais arquivos foram alterados e como testar.

## Quando simplificar

Se uma implementação começar a ficar grande demais, simplifique.

Prefira:

- menos abstrações;
- menos camadas;
- menos features;
- fluxo principal funcionando;
- README claro.

O objetivo do case é validar raciocínio, não entregar um produto completo.
