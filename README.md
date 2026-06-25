# TaskFlow

MVP fullstack de gerenciamento de tarefas com Kanban, dashboard analítico e notificações assíncronas por e-mail.

---

## Funcionalidades

- Cadastro e login com JWT
- Quadro Kanban com drag-and-drop
- Criação, edição, exclusão e movimentação de tarefas
- Histórico de movimentações
- Dashboard com métricas agregadas e filtros por período
- Notificações assíncronas por e-mail via BullMQ + Redis
- Worker separado da API para processar as notificações
- Seed automático com dados de demonstração

---

## Stack

| Camada     | Tecnologia                              |
| ---------- | --------------------------------------- |
| Frontend   | Next.js 14, React, TypeScript, Tailwind |
| Backend    | NestJS, TypeScript, TypeORM             |
| Banco      | PostgreSQL                              |
| Fila       | BullMQ + Redis                          |
| Auth       | JWT + Passport                          |
| Infra      | Docker Compose + Makefile               |

---

## Pré-requisitos

- Docker e Docker Compose
- Make

Node.js, PostgreSQL e Redis rodam via Docker — não é necessário instalá-los localmente.

---

## Como executar com Docker

```bash
git clone https://github.com/Coimbra777/desafio-atomic.git
cd desafio-atomic

cp .env.example .env
make setup
```

O `make setup` sobe todos os containers, executa as migrations e o seed de demonstração.

Após inicializar:

| Serviço    | URL                          |
| ---------- | ---------------------------- |
| Frontend   | http://localhost:3000        |
| API        | http://localhost:3001        |
| Health     | http://localhost:3001/health |

---

## Como executar localmente (sem Docker)

Requisitos: Node.js >= 20, PostgreSQL e Redis rodando localmente.

```bash
# backend
cd backend
cp ../.env.example .env   # ajuste DB_HOST=localhost e REDIS_HOST=localhost
npm install
npm run migration:run
npm run seed
npm run start:dev

# worker (terminal separado)
npm run start:worker

# frontend
cd ../frontend
npm install
npm run dev
```

---

## Credenciais de demonstração

Senha de todos os usuários: `Taskflow@123`

| Nome         | E-mail                |
| ------------ | --------------------- |
| Gabriel      | gabriel@taskflow.dev  |
| Ana Souza    | ana@taskflow.dev      |
| Carlos Lima  | carlos@taskflow.dev   |
| Marina Costa | marina@taskflow.dev   |
| João Pereira | joao@taskflow.dev     |

---

## Estrutura do projeto

```
backend/src/
  database/
    migrations/          migrações TypeORM
    seeds/               seed de demo (idempotente)
  modules/
    auth/                autenticação JWT
    users/               cadastro e perfil
    tasks/               tarefas e movimentações
    dashboard/           métricas agregadas
    notifications/       publisher, processor e tipos de eventos
    health/              health check
  scripts/
    notify-due-soon.ts   script para enfileirar notificações de vencimento
  main.ts                entrada da API HTTP
  worker.ts              entrada do worker BullMQ

frontend/src/
  app/                   rotas Next.js App Router
  components/            componentes visuais (Kanban, Dashboard, Forms, UI)
  lib/                   cliente HTTP e contexto de autenticação
  types/                 tipos compartilhados
```

---

## Comandos úteis

| Comando                    | Ação                                        |
| -------------------------- | ------------------------------------------- |
| `make up`                  | Sobe todos os serviços                      |
| `make down`                | Para os serviços                            |
| `make reset`               | Para e apaga volumes                        |
| `make logs`                | Logs de API, worker e frontend              |
| `make logs-api`            | Logs da API                                 |
| `make logs-worker`         | Logs do worker                              |
| `make seed`                | Executa o seed manualmente                  |
| `make notify-due-soon`     | Enfileira notificações de vencimento próximo|
| `make migrate`             | Executa migrations manualmente              |
| `make test`                | Validações disponíveis                      |

---

## Fila de e-mail e worker

A API não envia e-mail diretamente. O fluxo é:

```
Ação no Kanban
     ↓
API salva no PostgreSQL
     ↓
API publica job na fila BullMQ
     ↓
Redis armazena o job
     ↓
Worker consome a fila e envia via Mailtrap API (fetch nativo)
```

**Eventos atuais:**

| Evento             | Gatilho                                        |
| ------------------ | ---------------------------------------------- |
| `task-assigned`    | Task atribuída a um usuário                    |
| `task-status-changed` | Status da task alterado                     |
| `task-due-soon`    | Task vence nas próximas 24h (script manual)    |

**Idempotência do `task-due-soon`:** o jobId é `task-due-soon:<taskId>:<yyyy-mm-dd>`. Reexecutar o script no mesmo dia não duplica notificações — o BullMQ ignora jobs com mesmo ID já existentes.

**Retry:** 3 tentativas com backoff exponencial (delay inicial de 5s). Configurado no publisher via `defaultJobOptions`.

**Sem Mailtrap configurado:** o worker simula o envio com `console.log`. Nenhuma conta externa necessária para rodar o projeto.

**Com Mailtrap configurado:** adicione no `.env`:

```env
MAILTRAP_API_TOKEN=seu-token-aqui
MAILTRAP_API_URL=https://send.api.mailtrap.io/api/send
MAIL_FROM_ADDRESS=hello@seudominio.com
MAIL_FROM_NAME=TaskFlow
```

---

## Notificação de vencimento próximo

Para enfileirar notificações das tasks que vencem nas próximas 24h:

```bash
# via Docker
docker compose exec api npm run notify:due-soon

# ou pelo Makefile
make notify-due-soon
```

O script consulta o banco, filtra tasks não concluídas com `dueDate` entre agora e +24h, e publica um job por task. O responsável recebe a notificação; se não houver responsável, o criador recebe.

---

## Decisões técnicas e trade-offs

**Sem refresh token** — token JWT expira em 1 dia e exige novo login. Em produção, refresh token com rotação seria mais seguro.

**Token em localStorage** — simples para MVP. Em produção, `HttpOnly cookie` protege contra XSS.

**Sem RBAC** — qualquer usuário autenticado pode editar ou excluir qualquer task. Em produção, permissões por role ou por ownership seriam necessárias.

**Delete físico** — tarefas excluídas não vão para lixeira. Soft delete seria preferível em produção.

**Notificações via Mailtrap / fallback por log** — o worker suporta envio real ou simulação sem configuração adicional.

**Sem DLQ explícita** — o BullMQ armazena jobs com falha (`removeOnFail: 50`). Em produção, uma DLQ explícita com alerta facilitaria observabilidade.

**Idempotência de notificações por jobId** — suficiente para MVP. Em produção, uma tabela de controle de notificações enviadas seria mais robusta.

**Redis local sem persistência forte** — adequado para desenvolvimento. Em produção, configurar `appendonly yes` ou usar Redis gerenciado.

**Migrations e seed no boot** — facilita avaliação local. Em produção, migrations rodariam em etapa controlada de deploy.

**Testes automatizados** — nesta versão, a prioridade foi entregar o fluxo completo da aplicação: autenticação, Kanban, dashboard, fila assíncrona e worker separado. Como evolução imediata, eu adicionaria testes unitários para `AuthService`, `TasksService` e `NotificationsProcessor`, além de testes e2e para os fluxos de login, criação de task, movimentação de status e geração de notificações.

**Sem WebSocket** — o Kanban não atualiza em tempo real entre múltiplos usuários.

**Dashboard sem comparação de períodos** — as agregações existentes cobrem os casos principais, mas não comparam períodos distintos.
