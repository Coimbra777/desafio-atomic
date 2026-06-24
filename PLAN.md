# PLAN.md — Plano de Implementação do TaskFlow

## Objetivo

Executar o case técnico em etapas pequenas, usando SDD e Codex, evitando gerar complexidade desnecessária.

Cada etapa deve ser implementada, testada manualmente e commitada antes da próxima.

## Regra principal

Não pedir ao Codex para criar o projeto inteiro de uma vez.

Sempre pedir tarefas pequenas, baseadas na `SPEC.md`, neste `PLAN.md` e no `AGENTS.md`.

## Observação sobre o projeto de referência

O projeto zip de referência foi usado apenas para orientar o padrão técnico:

- NestJS modular;
- TypeORM;
- migrations;
- Dockerfile multi-stage;
- Makefile;
- `.env.example`;
- DTOs com validação;
- services com regras de negócio.

Não copiar regras de negócio do projeto antigo.

Não manter o zip de referência dentro do repositório final.

O backend deste projeto deve permanecer em TypeORM, com:

- entidades por módulo em `src/modules/<module>/entities`;
- migrations em `src/database/migrations`;
- `src/database/data-source.ts` para CLI e execuções futuras de migration.

---

## Etapa 0 — Preparação SDD

Criar os arquivos base:

- `SPEC.md`
- `PLAN.md`
- `AGENTS.md`
- `README.md`
- `.env.example`

Critério de aceite:

- os arquivos existem;
- o escopo está claro;
- o README inicial explica o objetivo do projeto.

Commit sugerido:

```bash
git add .
git commit -m "docs: add initial project specification"
```

---

## Etapa 1 — Estrutura inicial do projeto

Criar estrutura:

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

Configurar `docker-compose.yml` com os serviços:

- `postgres`
- `redis`
- `api`
- `worker`
- `frontend`

Criar Dockerfiles iniciais:

```txt
backend/Dockerfile
frontend/Dockerfile
```

Nesta etapa, não implementar regra de negócio.

Critério de aceite:

- estrutura de pastas criada;
- Docker Compose definido;
- Makefile criado;
- variáveis básicas documentadas;
- README inicial atualizado.

Prompt sugerido para o Codex:

```txt
Leia SPEC.md, PLAN.md e AGENTS.md.

Implemente apenas a Etapa 1 do PLAN.md.

Crie a estrutura inicial do projeto com frontend, backend, docker-compose.yml, Makefile, .env.example e README inicial.

Configure os serviços postgres, redis, api, worker e frontend no docker-compose.yml.

Siga o padrão do projeto de referência:
- Dockerfile com stages base, development, builder e production;
- Makefile com comandos úteis;
- env_file usando .env;
- volumes para desenvolvimento;
- containers com nomes claros.

Não implemente autenticação.
Não implemente Kanban.
Não implemente dashboard.
Não implemente fila ainda.

Mantenha tudo simples e alinhado à SPEC.md.
```

Commit sugerido:

```bash
git add .
git commit -m "chore: setup initial project structure"
```

---

## Etapa 2 — Backend base com NestJS + TypeORM

Criar o backend com NestJS.

Implementar:

- estrutura base do NestJS;
- `main.ts`;
- `AppModule`;
- rota `GET /health`;
- `ConfigModule` global;
- configuração do TypeORM;
- conexão com PostgreSQL;
- `data-source.ts`;
- pasta `src/database/migrations`;
- `ValidationPipe` global;
- CORS;
- Helmet.

Não implementar autenticação ainda.

Critério de aceite:

- backend sobe localmente;
- backend sobe via Docker;
- `GET /health` retorna status OK;
- TypeORM conecta no PostgreSQL;
- estrutura segue o padrão do zip de referência.

Prompt sugerido:

```txt
Leia SPEC.md, PLAN.md e AGENTS.md.

Implemente apenas a Etapa 2 do PLAN.md.

Crie a base do backend NestJS dentro da pasta backend.

Siga o padrão do projeto de referência:
- ConfigModule global;
- TypeOrmModule.forRootAsync;
- src/database/data-source.ts;
- src/database/migrations;
- ValidationPipe global com whitelist, transform e forbidNonWhitelisted;
- controllers simples;
- código TypeScript sem complexidade desnecessária.

Configure:
- PostgreSQL
- TypeORM
- Helmet
- CORS
- rota GET /health

Não implemente auth.
Não implemente tasks.
Não implemente dashboard.
Não implemente fila.

Garanta que o backend rode via Docker Compose.
```

Commit sugerido:

```bash
git add .
git commit -m "feat: setup nestjs backend base"
```

---

## Etapa 3 — Autenticação

Implementar autenticação simples.

Backend:

- entidade `User`;
- migration `CreateUsersTable`;
- `AuthModule`;
- `UsersModule`;
- `POST /auth/register`;
- `POST /auth/login`;
- `GET /auth/me`;
- hash de senha com bcrypt;
- JWT;
- `JwtAuthGuard`;
- `JwtStrategy`;
- DTOs com validação e transform;
- seed de usuário inicial opcional.

Não implementar refresh token.

Critério de aceite:

- usuário consegue cadastrar;
- usuário consegue logar;
- senha não é salva em texto puro;
- rota protegida exige JWT;
- `/auth/me` retorna usuário autenticado;
- retorno não expõe `passwordHash`.

Prompt sugerido:

```txt
Leia SPEC.md, PLAN.md e AGENTS.md.

Implemente apenas a Etapa 3 do PLAN.md.

Crie autenticação simples no backend:
- entidade User com TypeORM
- migration CreateUsersTable
- AuthModule
- UsersModule
- POST /auth/register
- POST /auth/login
- GET /auth/me
- hash de senha com bcrypt
- JWT
- JwtAuthGuard
- JwtStrategy
- DTOs com class-validator e class-transformer

Siga o padrão do projeto de referência:
- entidades em entities/
- DTOs em dto/
- services com regras de negócio
- controllers finos
- toResponse para não retornar passwordHash
- migrations explícitas

Não implemente refresh token.
Não implemente roles.
Não implemente frontend ainda.

Atualize o README com exemplos de payload.
```

Commit sugerido:

```bash
git add .
git commit -m "feat: implement jwt authentication"
```

---

## Etapa 4 — Tasks e Kanban API

Implementar o módulo de tarefas.

Backend:

- entidade `Task`;
- entidade `TaskMovement`;
- enum `TaskStatus`;
- enum `TaskPriority`;
- migrations;
- CRUD de tasks;
- endpoint para alterar status;
- histórico de movimentação;
- proteção das rotas com JWT.

Rotas:

```txt
GET    /tasks
POST   /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id
PATCH  /tasks/:id/status
```

Critério de aceite:

- usuário autenticado consegue criar card;
- usuário autenticado consegue listar cards;
- usuário autenticado consegue editar card;
- usuário autenticado consegue excluir card;
- usuário autenticado consegue alterar status;
- alteração de status cria histórico de movimentação.

Prompt sugerido:

```txt
Leia SPEC.md, PLAN.md e AGENTS.md.

Implemente apenas a Etapa 4 do PLAN.md.

Crie o módulo de tasks no backend:
- entidade Task
- entidade TaskMovement
- enums TaskStatus e TaskPriority
- migrations explícitas
- CRUD de tasks
- endpoint PATCH /tasks/:id/status
- histórico de movimentações
- DTOs com validação e transform
- rotas protegidas por JWT

Siga o padrão do projeto de referência:
- modules/tasks
- dto/
- entities/
- service com validações
- controller simples
- TypeORM repositories
- mensagens de erro claras

Não implemente fila ainda.
Não implemente frontend ainda.

Mantenha controllers finos e regras de negócio nos services.
```

Commit sugerido:

```bash
git add .
git commit -m "feat: implement task management api"
```

---

## Etapa 5 — Fila com BullMQ e worker

Implementar notificações assíncronas.

Backend/API:

- configurar BullMQ;
- configurar Redis;
- criar fila `email-notifications`;
- criar `NotificationsModule`;
- criar `NotificationsPublisherService`;
- adicionar job quando card for atribuído;
- adicionar job quando status do card for alterado.

Worker:

- processo separado da API;
- consumir fila;
- simular envio de e-mail via log.

Não configurar SMTP real.

Critério de aceite:

- ao atribuir card, job é criado;
- ao alterar status, job é criado;
- worker processa job;
- log do worker mostra simulação do envio.

Prompt sugerido:

```txt
Leia SPEC.md, PLAN.md e AGENTS.md.

Implemente apenas a Etapa 5 do PLAN.md.

Configure notificações assíncronas com BullMQ e Redis:
- NotificationsModule
- NotificationsPublisherService
- fila email-notifications
- job ao atribuir card
- job ao alterar status
- worker separado para processar a fila
- simulação de envio de e-mail via Logger/console.log
- serviço worker no docker-compose.yml

Use uma abordagem simples parecida com o padrão do módulo de auditoria do projeto de referência:
- publisher separado;
- consumer/worker separado;
- logs claros;
- sem acoplar detalhes de fila no controller.

Não configurar SMTP real.
Não adicionar RabbitMQ.
Não adicionar MongoDB.
Não adicionar complexidade extra.

Atualize o README explicando a decisão técnica.
```

Commit sugerido:

```bash
git add .
git commit -m "feat: add async notification worker"
```

---

## Etapa 6 — Frontend base com Next.js

Criar frontend com Next.js.

Implementar:

- projeto Next.js;
- TypeScript;
- Tailwind;
- estrutura de rotas;
- cliente HTTP;
- tela de login;
- tela de cadastro;
- integração com backend;
- layout autenticado;
- proteção simples de rotas autenticadas.

Critério de aceite:

- usuário consegue cadastrar pelo frontend;
- usuário consegue logar pelo frontend;
- usuário autenticado acessa área protegida;
- usuário não autenticado é redirecionado para login.

Prompt sugerido:

```txt
Leia SPEC.md, PLAN.md e AGENTS.md.

Implemente apenas a Etapa 6 do PLAN.md.

Crie a base do frontend com Next.js:
- TypeScript
- Tailwind
- tela de login
- tela de cadastro
- integração com backend
- layout autenticado simples
- proteção de páginas autenticadas
- client de API

Não implemente Kanban ainda.
Não implemente dashboard ainda.

Priorize simplicidade e funcionamento.
```

Commit sugerido:

```bash
git add .
git commit -m "feat: setup frontend authentication"
```

---

## Etapa 7 — Kanban no frontend

Implementar quadro Kanban.

Frontend:

- página `/kanban`;
- listagem de tasks agrupadas por status;
- colunas:
  - A Fazer;
  - Em Andamento;
  - Em Revisão;
  - Concluído;
- drag and drop com `dnd-kit`;
- chamada ao backend ao mover card;
- botão para criar novo card;
- modal de criação/edição;
- exclusão de card;
- exibição do histórico de movimentação.

Critério de aceite:

- cards aparecem agrupados por status;
- usuário consegue criar card;
- usuário consegue editar card;
- usuário consegue excluir card;
- usuário consegue mover card entre colunas;
- status é atualizado no backend;
- histórico é exibido no modal.

Prompt sugerido:

```txt
Leia SPEC.md, PLAN.md e AGENTS.md.

Implemente apenas a Etapa 7 do PLAN.md.

Crie a tela Kanban no frontend:
- página /kanban
- colunas A Fazer, Em Andamento, Em Revisão e Concluído
- listagem de tasks agrupadas por status
- drag and drop com dnd-kit
- ao mover card, chamar PATCH /tasks/:id/status
- modal simples de criação e edição
- exclusão de card
- exibição do histórico de movimentação

Não implemente upload de anexos.
Não implemente dashboard ainda.

O drag and drop é indispensável para o case.
```

Commit sugerido:

```bash
git add .
git commit -m "feat: implement kanban board"
```

---

## Etapa 8 — Dashboard simples

Implementar dashboard analítico.

Backend:

- `DashboardModule`;
- `GET /dashboard/summary`;
- cards por status;
- tarefas por responsável;
- tarefas atrasadas;
- conclusões por dia, se simples.

Frontend:

- página `/dashboard`;
- cards resumo;
- gráfico de cards por status;
- gráfico de tarefas por responsável;
- total de tarefas atrasadas;
- filtro simples por período.

Critério de aceite:

- dashboard carrega dados reais do backend;
- gráficos ou cards são exibidos;
- filtro por período funciona de forma simples.

Prompt sugerido:

```txt
Leia SPEC.md, PLAN.md e AGENTS.md.

Implemente apenas a Etapa 8 do PLAN.md.

Crie dashboard simples.

Backend:
- DashboardModule
- GET /dashboard/summary
- cards por status
- tarefas por responsável
- tarefas atrasadas
- conclusões por dia se for simples

Frontend:
- página /dashboard
- cards de resumo
- gráfico de cards por status
- gráfico de tarefas por responsável
- total de tarefas atrasadas
- filtro simples por período

Use Recharts ou uma solução simples equivalente.

Não adicione complexidade desnecessária.
```

Commit sugerido:

```bash
git add .
git commit -m "feat: add analytics dashboard"
```

---

## Etapa 9 — README e revisão final

Revisar o projeto completo.

Verificar:

- Docker Compose;
- Makefile;
- `.env.example`;
- README;
- comandos de execução;
- decisões técnicas;
- trade-offs;
- melhorias futuras;
- remoção de código morto;
- ausência de secrets commitados;
- fluxo principal funcionando.

Critério de aceite:

- `docker compose up --build` funciona;
- `make setup` funciona, se Makefile for implementado;
- README permite que outra pessoa rode o projeto;
- trade-offs estão documentados;
- features fora de escopo estão explicadas;
- projeto está simples e coerente.

Prompt sugerido:

```txt
Leia SPEC.md, PLAN.md e AGENTS.md.

Faça a revisão final do projeto.

Escopo:
- verificar se docker compose up --build está documentado
- revisar Makefile
- revisar README
- documentar variáveis de ambiente
- documentar decisões técnicas
- documentar trade-offs
- remover código morto
- melhorar mensagens de erro simples
- garantir que não há secrets commitados
- garantir que o fluxo principal está claro

Não adicione novas features.
Não aumente a complexidade.
```

Commit sugerido:

```bash
git add .
git commit -m "docs: improve project documentation"
```

---

## Ordem final de commits esperada

```txt
docs: add initial project specification
chore: setup initial project structure
feat: setup nestjs backend base
feat: implement jwt authentication
feat: implement task management api
feat: add async notification worker
feat: setup frontend authentication
feat: implement kanban board
feat: add analytics dashboard
docs: improve project documentation
```

## Observação final

A entrega deve parecer simples, intencional e bem documentada.

O objetivo não é criar um produto robusto, mas demonstrar maturidade na priorização, separação de responsabilidades e clareza técnica.
