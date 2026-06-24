# TaskFlow

TaskFlow e um MVP fullstack de gerenciamento de tarefas com Kanban, autenticacao, dashboard simples e notificacoes assincronas via fila. Este repositorio segue o case tecnico descrito em `SPEC.md`, com execucao incremental definida em `PLAN.md`.

## Status atual

Esta entrega cobre as Etapas 1, 2 e 3 do plano:

- estrutura inicial de `frontend/` e `backend/`;
- `docker-compose.yml` com `postgres`, `redis`, `api`, `worker` e `frontend`;
- Dockerfiles multi-stage com `base`, `development`, `builder` e `production`;
- `Makefile` com comandos basicos de ambiente e migration;
- `.env.example`;
- README inicial;
- backend real em NestJS com TypeORM, autenticacao JWT, usuarios e rota `GET /health`.

Ainda nao foram implementados:

- Kanban;
- dashboard;
- fila BullMQ;
- base Next.js.

O container `api` ja executa a base real do NestJS. `worker` e `frontend` continuam como placeholders ate as proximas etapas.

## Stack planejada

- Frontend: Next.js + React + TypeScript
- Backend: NestJS + TypeScript
- ORM: TypeORM
- Banco: PostgreSQL
- Cache/fila: Redis + BullMQ
- Infra local: Docker Compose

## Estrutura inicial

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

## Como executar

1. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Suba os containers:

```bash
docker compose up --build
```

Ou:

```bash
make setup
```

## Servicos

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

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

As variaveis iniciais ficam em `.env.example` e cobrem:

- portas do frontend e backend;
- URL publica do frontend;
- conexao com PostgreSQL;
- conexao com Redis;
- portas publicadas de Postgres e Redis no host;
- configuracao futura de JWT;
- credenciais futuras de seed.

## Decisoes tecnicas

- PostgreSQL foi escolhido para seguir a especificacao do case.
- Redis ja esta presente no compose para suportar BullMQ nas proximas etapas.
- O worker foi scaffoldado no compose agora, mas sem fila implementada ainda.
- Os Dockerfiles foram preparados em multi-stage para manter consistencia com o projeto de referencia.

## Backend atual

Na Etapa 2, o backend passou a ter:

- NestJS real no diretorio `backend/`;
- `ConfigModule` global;
- `TypeOrmModule.forRootAsync` com PostgreSQL;
- `src/database/data-source.ts` para futuras migrations;
- padrao de persistencia baseado em TypeORM, sem Prisma;
- `entities` por modulo e `src/database/migrations` como estrutura oficial para evolucao do banco;
- `AuthModule` com `POST /auth/register`, `POST /auth/login` e `GET /auth/me`;
- `UsersModule` com `GET /users` protegido por JWT;
- `Helmet`, `CORS` e `ValidationPipe` global;
- `GET /health`.

## Autenticacao

### Register

`POST /auth/register`

```json
{
  "name": "Gabriel Coimbra",
  "email": "gabriel@example.com",
  "password": "ChangeMe123!"
}
```

### Login

`POST /auth/login`

```json
{
  "email": "gabriel@example.com",
  "password": "ChangeMe123!"
}
```

Resposta esperada:

```json
{
  "access_token": "TOKEN_JWT",
  "token_type": "Bearer"
}
```

### Auth me

`GET /auth/me`

Header:

```txt
Authorization: Bearer TOKEN_JWT
```

## Trade-offs desta etapa

- A base Next.js ainda nao foi criada para respeitar a separacao definida no `PLAN.md`.
- `worker` continua como placeholder porque a fila BullMQ nao faz parte desta etapa.
- A autenticacao foi mantida simples, sem refresh token, roles ou permissoes avancadas.
- O fluxo de usuarios foi mantido enxuto, retornando sempre o usuario sem `passwordHash`.

## Proximas etapas

- Etapa 4+: tasks, Kanban, dashboard e notificacoes
