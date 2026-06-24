# SPEC.md — TaskFlow

## 1. Visão geral

O **TaskFlow** é um MVP fullstack de gerenciamento de tarefas com quadro Kanban, autenticação de usuários, dashboard analítico simples e notificações assíncronas por fila.

Este projeto será desenvolvido como case técnico para a vaga de **Desenvolvedor Fullstack Pleno com foco em Frontend**.

O objetivo principal não é criar uma ferramenta robusta de gestão de tarefas, mas demonstrar:

- linha de raciocínio;
- organização técnica;
- priorização de escopo;
- domínio de frontend, backend e infraestrutura local;
- clareza para explicar decisões e trade-offs.

A entrega deve ser simples, funcional, fácil de rodar e bem documentada.

## 2. Stack obrigatória do case

Conforme o PDF do desafio:

- Frontend: React + Next.js
- Backend: NestJS
- Banco de dados: PostgreSQL
- Fila/cache: Redis
- Fila assíncrona: BullMQ
- Infra local: Docker / Docker Compose

## 3. Padrão técnico adotado com base no projeto de referência

O projeto seguirá o padrão do zip de referência analisado, adaptado ao novo case:

- NestJS modular;
- TypeORM;
- entidades em `src/modules/<module>/entities`;
- DTOs em `src/modules/<module>/dto`;
- migrations em `src/database/migrations`;
- `data-source.ts` para TypeORM CLI;
- `create-database.ts` quando útil;
- `seed.ts` para usuário inicial e dados básicos;
- `ConfigModule` global;
- `ValidationPipe` global com:
  - `whitelist: true`;
  - `transform: true`;
  - `forbidNonWhitelisted: true`;
- Dockerfile com stages `base`, `development`, `builder` e `production`;
- `docker-compose.yml` com serviços nomeados;
- `Makefile` com comandos úteis;
- `.env.example` completo;
- README com instruções, decisões técnicas e trade-offs.

Diferenças necessárias em relação ao projeto de referência:

- usar PostgreSQL em vez de SQL Server;
- manter TypeORM como ORM principal do projeto;
- usar BullMQ + Redis em vez de RabbitMQ/MongoDB;
- adicionar frontend Next.js, pois o projeto de referência é somente backend;
- manter escopo mais simples, focado no case.

Observação:

- não usar Prisma neste projeto;
- manter o fluxo de banco baseado em `entities`, `migrations` explícitas e `src/database/data-source.ts`.

## 4. Objetivo do MVP

Criar uma aplicação em que o usuário consiga:

1. cadastrar uma conta;
2. fazer login;
3. acessar rotas protegidas;
4. visualizar um quadro Kanban;
5. criar, editar, excluir e mover cards entre colunas;
6. visualizar histórico de movimentações de um card;
7. visualizar dashboard analítico simples;
8. gerar notificações assíncronas quando um card for atribuído ou tiver status alterado.

## 5. Escopo funcional

### 5.1. Autenticação de usuários

Implementar:

- cadastro de usuário;
- login;
- hash de senha com `bcrypt`;
- autenticação via JWT;
- proteção de rotas no frontend;
- proteção de rotas no backend;
- validação dos formulários no frontend;
- validação dos DTOs no backend.

Rotas mínimas:

```txt
POST /auth/register
POST /auth/login
GET  /auth/me
```

Payload de cadastro:

```json
{
  "name": "Gabriel Coimbra",
  "email": "gabriel@example.com",
  "password": "ChangeMe123!"
}
```

Payload de login:

```json
{
  "email": "gabriel@example.com",
  "password": "ChangeMe123!"
}
```

Resposta de login:

```json
{
  "accessToken": "TOKEN_JWT",
  "tokenType": "Bearer"
}
```

### 5.2. Usuários

Implementar listagem simples de usuários para permitir escolha de responsável no card.

Rotas mínimas:

```txt
GET /users
```

A resposta nunca deve retornar `passwordHash`.

### 5.3. Quadro Kanban

O Kanban deve ter as seguintes colunas padrão:

- A Fazer
- Em Andamento
- Em Revisão
- Concluído

Regras:

- cards devem ser arrastáveis entre colunas;
- o drag and drop é indispensável;
- ao mover um card, o status deve ser atualizado no backend;
- a mudança de status deve ser persistida no banco;
- a movimentação deve gerar registro no histórico;
- a movimentação deve gerar job de notificação na fila.

Status internos:

```txt
todo
in_progress
in_review
done
```

Labels exibidas no frontend:

```txt
todo        -> A Fazer
in_progress -> Em Andamento
in_review   -> Em Revisão
done        -> Concluído
```

### 5.4. Cards / Tasks

Implementar CRUD de cards.

Campos:

- título;
- descrição;
- responsável;
- prioridade;
- data de entrega;
- tags/etiquetas;
- status;
- histórico de movimentações.

Prioridades internas:

```txt
low
medium
high
```

Labels exibidas no frontend:

```txt
low    -> Baixa
medium -> Média
high   -> Alta
```

Rotas mínimas:

```txt
GET    /tasks
POST   /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id
PATCH  /tasks/:id/status
```

### 5.5. Modal de edição de card

O modal deve permitir editar:

- título;
- descrição;
- responsável;
- prioridade;
- data de entrega;
- tags/etiquetas.

O modal também deve exibir:

- histórico de movimentações do card.

### 5.6. Upload de anexos

Upload de anexos está fora do escopo do MVP.

Justificativa:

- o próprio case informa que upload de anexos não é obrigatório;
- o foco será garantir o fluxo principal funcionando bem;
- essa funcionalidade será documentada como melhoria futura.

### 5.7. Dashboard analítico

Implementar dashboard simples com:

- total de cards por status;
- total de tarefas por responsável;
- total de tarefas atrasadas;
- filtro simples por período.

Opcional se houver tempo:

- fluxo de conclusão ao longo do tempo.

Rota mínima:

```txt
GET /dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
```

Resposta sugerida:

```json
{
  "tasksByStatus": [
    { "status": "todo", "total": 5 },
    { "status": "in_progress", "total": 3 }
  ],
  "tasksByAssignee": [
    { "assigneeName": "Maria", "total": 4 }
  ],
  "overdueTasks": 2,
  "completedByDay": [
    { "date": "2026-06-24", "total": 3 }
  ]
}
```

### 5.8. Fila de notificações por e-mail

Implementar fila assíncrona com Redis + BullMQ.

Eventos que devem gerar job:

- quando um card for atribuído a um responsável;
- quando o status de um card for alterado.

Evento opcional se houver tempo:

- quando a data de entrega estiver próxima.

O worker deve processar os jobs separadamente da API.

Para simplificar o MVP, o envio de e-mail pode ser simulado via log.

Exemplo de log:

```txt
[EmailWorker] Sending notification to gabriel@example.com: Task "Ajustar Kanban" changed status to done
```

Justificativa:

- envio de e-mail é dependência externa;
- não deve bloquear a request HTTP;
- fila permite retry e processamento assíncrono;
- simulação por log evita dependência de SMTP real no case.

## 6. Modelagem sugerida

### 6.1. User

Tabela: `users`

Campos:

```txt
id
name
email
password_hash
created_at
updated_at
```

### 6.2. Task

Tabela: `tasks`

Campos:

```txt
id
title
description
status
priority
due_date
tags
assignee_id
created_by
created_at
updated_at
```

Observações:

- `tags` pode ser salvo como `simple-array` no TypeORM para manter o MVP simples.
- `assignee_id` referencia `users.id`.
- `created_by` armazena o usuário autenticado que criou o card.

### 6.3. TaskMovement

Tabela: `task_movements`

Campos:

```txt
id
task_id
from_status
to_status
moved_by
created_at
```

Observações:

- `task_id` referencia `tasks.id`;
- `moved_by` referencia `users.id`;
- `from_status` pode ser nulo na criação inicial do card.

## 7. Escopo não funcional

### 7.1. Docker

O projeto deve subir com:

```bash
docker compose up --build
```

Ou com Makefile:

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

### 7.2. README

O README deve conter:

- descrição do projeto;
- stack utilizada;
- funcionalidades;
- pré-requisitos;
- como executar com Docker;
- como executar localmente;
- variáveis de ambiente;
- endpoints principais;
- decisões técnicas;
- trade-offs considerados;
- melhorias futuras.

### 7.3. Commits

Usar commits organizados e mensagens semânticas:

```txt
chore:
feat:
fix:
docs:
refactor:
```

## 8. Fora do escopo

Não implementar nesta versão:

- upload de anexos;
- refresh token;
- RBAC avançado;
- permissões por equipe/workspace;
- WebSocket;
- multi-tenant;
- CI/CD;
- deploy em cloud;
- e-mail real via SMTP;
- testes E2E complexos;
- design system robusto.

## 9. Critérios de aceite

A entrega será considerada válida se for possível:

- subir o ambiente com Docker Compose;
- cadastrar usuário;
- fazer login;
- acessar área autenticada;
- criar card;
- editar card;
- excluir card;
- mover card entre colunas do Kanban;
- persistir alteração de status no banco;
- visualizar histórico de movimentação;
- visualizar dashboard simples;
- processar job de notificação no worker;
- entender as decisões técnicas pelo README.

## 10. Decisão principal

Este projeto prioriza o fluxo principal do produto e a clareza da implementação.

A solução não busca ser completa como uma ferramenta profissional de gestão de tarefas. O foco é entregar um MVP simples, bem organizado, executável e com decisões técnicas bem documentadas.
