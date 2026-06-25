# TaskFlow

MVP fullstack de gerenciamento de tarefas com autenticação, Kanban, dashboard analítico e notificações assíncronas.

## Stack

- **Frontend**: Next.js + React + TypeScript
- **Backend**: NestJS + TypeScript + TypeORM
- **Banco**: PostgreSQL
- **Fila**: BullMQ + Redis
- **Infra local**: Docker Compose

## Estrutura

```
taskflow/
  backend/
    src/
      database/
        migrations/     migrações TypeORM
        seeds/          seeds por domínio (users, tasks, movements)
      modules/
        auth/ users/ tasks/ dashboard/ notifications/ health/
      main.ts           API HTTP
      worker.ts         consumidor BullMQ
  frontend/
    src/
      app/              rotas Next.js App Router
      components/
      lib/              cliente de API e helpers
  docker-compose.yml
  Makefile
  .env.example
```

## Como subir

```bash
cp .env.example .env
make up
```

Ao subir, as migrations e o seed de demonstração são aplicados automaticamente.

| Serviço   | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:3000  |
| Backend   | http://localhost:3001  |
| Postgres  | localhost:5432         |
| Redis     | localhost:6379         |

## Comandos úteis

| Comando            | Ação                                    |
|--------------------|-----------------------------------------|
| `make up`          | Sobe todos os serviços                  |
| `make down`        | Para os serviços                        |
| `make reset`       | Para e apaga todos os volumes           |
| `make logs`        | Logs de api, worker e frontend          |
| `make logs-api`    | Logs da API                             |
| `make logs-worker` | Logs do worker                          |
| `make ps`          | Status dos containers                   |
| `make migrate`     | Executa migrations manualmente          |
| `make seed`        | Executa o seed manualmente              |

## Credenciais de demo

Senha de todos os usuários: `Taskflow@123`

| Nome         | E-mail               |
|--------------|----------------------|
| Gabriel      | gabriel@taskflow.dev |
| Ana Souza    | ana@taskflow.dev     |
| Carlos Lima  | carlos@taskflow.dev  |
| Marina Costa | marina@taskflow.dev  |
| João Pereira | joao@taskflow.dev    |

O seed popula 5 usuários, 25 tasks distribuídas entre as colunas e 38 movimentações históricas para o dashboard.
É idempotente: usuários são ignorados se já existem; tasks com a tag `seed` são deletadas e recriadas.

## Trade-offs

- **Sem refresh token**: token expira em 1d e exige novo login
- **Token em localStorage**: mais simples para MVP; em produção, `HttpOnly cookie` seria mais seguro contra XSS
- **Sem RBAC**: qualquer usuário autenticado pode editar ou excluir qualquer task
- **Delete físico**: tasks excluídas não vão para lixeira; operação irreversível
- **Notificações simuladas**: worker loga em vez de enviar e-mail real; substituível por qualquer provider sem alterar o contrato da fila
- **Sem WebSocket**: board atualiza por reload manual
- **Dashboard simples**: agregações sem comparativos temporais entre períodos; extensível sem alterar o schema
