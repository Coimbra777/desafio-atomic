# TaskFlow

MVP fullstack de gerenciamento de tarefas com autenticação, Kanban, dashboard analítico e notificações assíncronas.

O projeto simula uma aplicação de gestão de tarefas parecida com um quadro Kanban, onde usuários podem criar tarefas, atribuir responsáveis, mover cards entre colunas e acompanhar métricas no dashboard.

Além da API e do frontend, o projeto também possui um **worker separado** responsável por processar notificações assíncronas usando fila com Redis e BullMQ.

---

## O que o projeto entrega

- Cadastro e login de usuários
- Autenticação com JWT
- Tela protegida após login
- Quadro Kanban com drag and drop
- Criação, edição, exclusão e movimentação de tarefas
- Histórico de movimentações das tarefas
- Dashboard com métricas agregadas
- Fila assíncrona para notificações de e-mail
- Worker separado da API
- Seed automático com dados de demonstração
- Ambiente local via Docker Compose e Makefile

---

## Stack

| Camada         | Tecnologias                              |
| -------------- | ---------------------------------------- |
| Frontend       | Next.js, React, TypeScript, Tailwind CSS |
| Backend        | NestJS, TypeScript, TypeORM              |
| Banco de dados | PostgreSQL                               |
| Fila / Jobs    | BullMQ + Redis                           |
| Autenticação   | JWT + Passport                           |
| Worker         | NestJS Application Context + BullMQ      |
| Infra local    | Docker Compose + Makefile                |

---

## Estrutura do projeto

```txt
taskflow/
  backend/
    src/
      database/
        migrations/       migrações TypeORM
        seeds/            seeds separados por domínio
          seed.ts          orquestrador principal
          seed-users.ts    usuários de demonstração
          seed-tasks.ts    tarefas de demonstração
          seed-movements.ts histórico das movimentações
      modules/
        auth/              autenticação e login
        users/             usuários
        tasks/             tarefas e movimentações
        dashboard/         métricas e gráficos
        notifications/     publicação e processamento de notificações
        health/            health check simples
      main.ts              entrada da API HTTP
      worker.ts            entrada do worker BullMQ
      worker.module.ts     módulo específico do worker

  frontend/
    src/
      app/                 rotas Next.js App Router
      components/          componentes visuais
      lib/                 cliente HTTP, autenticação e helpers
      types/               tipos compartilhados no frontend

  docker-compose.yml       serviços locais
  Makefile                 atalhos para subir, parar e validar o projeto
  .env.example             exemplo de variáveis de ambiente
```

---

## Pré-requisitos

Antes de subir o projeto, instale:

- Git
- Docker
- Docker Compose
- Make

Não é necessário instalar PostgreSQL, Redis, Node.js ou dependências manualmente na máquina, pois tudo roda via Docker.

---

## Como clonar e subir o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Coimbra777/desafio-atomic.git
cd taskflow
```

### 2. Crie o arquivo de ambiente

```bash
cp .env.example .env
```

O projeto já vem preparado para rodar localmente usando as variáveis do `.env.example`.

### 3. Suba os containers

```bash
make setup
```

Esse comando sobe todos os serviços necessários:

- PostgreSQL
- Redis
- API NestJS
- Worker de notificações
- Frontend Next.js

Durante a inicialização da API, o projeto executa automaticamente:

1. instalação das dependências;
2. migrations do banco;
3. seed de demonstração;
4. inicialização da API.

---

## Acessos locais

| Serviço             | URL                          |
| ------------------- | ---------------------------- |
| Frontend            | http://localhost:3000        |
| Backend             | http://localhost:3001        |
| Health check da API | http://localhost:3001/health |
| PostgreSQL          | localhost:5432               |
| Redis               | localhost:6379               |

---

## Credenciais de demonstração

Senha de todos os usuários:

```txt
Taskflow@123
```

| Nome         | E-mail                                              |
| ------------ | --------------------------------------------------- |
| Gabriel      | [gabriel@taskflow.dev](mailto:gabriel@taskflow.dev) |
| Ana Souza    | [ana@taskflow.dev](mailto:ana@taskflow.dev)         |
| Carlos Lima  | [carlos@taskflow.dev](mailto:carlos@taskflow.dev)   |
| Marina Costa | [marina@taskflow.dev](mailto:marina@taskflow.dev)   |
| João Pereira | [joao@taskflow.dev](mailto:joao@taskflow.dev)       |

Após subir o projeto, acesse o frontend em:

```txt
http://localhost:3000
```

Faça login usando um dos e-mails acima e a senha de demonstração.

---

## Dados criados pelo seed

O seed popula automaticamente:

- 5 usuários;
- 25 tarefas;
- tarefas distribuídas entre as colunas do Kanban;
- 38 movimentações históricas;
- dados suficientes para visualizar o dashboard.

O seed é idempotente:

- usuários já existentes são ignorados;
- tarefas com a tag `seed` são apagadas e recriadas;
- movimentações históricas são recriadas de acordo com as tarefas de demonstração.

Isso permite resetar os dados de demo sem duplicar registros.

---

## Como funciona a aplicação

### 1. Autenticação

O usuário faz login pelo frontend.

A API valida o e-mail e senha, gera um token JWT e o frontend armazena esse token para acessar as rotas protegidas.

Rotas principais:

```txt
POST /auth/register
POST /auth/login
GET /auth/me
```

---

### 2. Kanban

Depois do login, o usuário acessa o quadro Kanban.

No Kanban é possível:

- criar tarefas;
- editar tarefas;
- excluir tarefas;
- atribuir responsáveis;
- definir prioridade;
- definir prazo;
- mover tarefas entre colunas.

As colunas principais são:

```txt
A Fazer
Em Andamento
Em Revisão
Concluído
```

Quando uma tarefa muda de coluna, o frontend chama a API para atualizar o status da tarefa.

---

### 3. Dashboard

O dashboard exibe métricas com base nas tarefas e movimentações.

Exemplos de informações exibidas:

- total de tarefas;
- tarefas atrasadas;
- tarefas concluídas;
- distribuição por status;
- distribuição por responsável;
- conclusões por dia.

O dashboard usa consultas agregadas no backend para evitar que o frontend precise calcular os dados manualmente.

---

## Como funciona a fila de e-mail

O projeto possui uma fila de notificações usando **BullMQ** com **Redis**.

A fila simula o envio de e-mails quando eventos importantes acontecem nas tarefas.

### Fluxo resumido

```txt
Usuário realiza uma ação no Kanban
        ↓
API atualiza a tarefa no PostgreSQL
        ↓
API publica um job na fila BullMQ
        ↓
Redis armazena o job
        ↓
Worker separado consome a fila
        ↓
Worker envia e-mail real (Mailtrap) ou registra log de simulação
```

### Eventos que geram notificações

Atualmente, a API publica notificações quando:

- uma tarefa é atribuída a um usuário;
- uma tarefa muda de status.

Exemplos:

```txt
task-assigned
task-status-changed
```

### Por que usar fila?

A fila evita que a API precise esperar o envio de e-mail terminar.

Em vez de fazer tudo na mesma requisição, a API apenas registra um job na fila e responde mais rápido para o usuário.

O processamento pesado ou externo, como envio de e-mail, fica para o worker.

### Qual é o papel da API?

A API é responsável por:

- receber a requisição do frontend;
- validar os dados;
- salvar as alterações no PostgreSQL;
- publicar o evento de notificação na fila.

### Qual é o papel do Redis?

O Redis funciona como armazenamento da fila.

Ele guarda os jobs pendentes, processados ou com falha.

### Qual é o papel do worker?

O worker é um processo separado da API.

Ele fica escutando a fila e processa os jobs de notificação.

O worker opera em dois modos:

- **Modo simulado** (padrão): quando `MAIL_ENABLED` não está definido como `true`, o worker registra logs simulando o envio. Nenhuma configuração SMTP é necessária.
- **Modo real**: quando `MAIL_ENABLED=true` e as variáveis SMTP estão preenchidas, o worker envia e-mails reais via Nodemailer (Mailtrap por padrão).

Para ativar o envio real, configure no `.env`:

```env
MAIL_ENABLED=true
MAIL_HOST=live.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=api
MAIL_PASSWORD=sua-senha-aqui
MAIL_FROM_ADDRESS=hello@demomailtrap.co
MAIL_FROM_NAME="TaskFlow"
```

Sem essas variáveis, o worker continua funcionando normalmente em modo simulado.

---

## Serviços do Docker Compose

| Serviço  | Responsabilidade                   |
| -------- | ---------------------------------- |
| postgres | Banco de dados principal           |
| redis    | Armazenamento da fila BullMQ       |
| api      | Backend NestJS HTTP                |
| worker   | Consumidor da fila de notificações |
| frontend | Interface Next.js                  |

A API e o worker usam o mesmo backend, mas iniciam processos diferentes:

```txt
API     → npm run start:dev
Worker  → npm run worker:dev
```

Dessa forma, se o worker tiver problema, a API pode continuar funcionando. E se a API receber muitas requisições, o processamento assíncrono pode ser escalado separadamente.

---

## Comandos úteis

| Comando            | Ação                                  |
| ------------------ | ------------------------------------- |
| `make up`          | Sobe todos os serviços                |
| `make down`        | Para os serviços                      |
| `make reset`       | Para os serviços e apaga volumes      |
| `make logs`        | Mostra logs de API, worker e frontend |
| `make logs-api`    | Mostra logs apenas da API             |
| `make logs-worker` | Mostra logs apenas do worker          |
| `make ps`          | Lista containers ativos               |
| `make migrate`     | Executa migrations manualmente        |
| `make seed`        | Executa o seed manualmente            |
| `make test`        | Executa validações/testes disponíveis |

---

## Como validar se está tudo funcionando

Após rodar:

```bash
make up
```

Verifique os containers:

```bash
make ps
```

Acompanhe os logs da API:

```bash
make logs-api
```

Acompanhe os logs do worker:

```bash
make logs-worker
```

Depois acesse:

```txt
http://localhost:3000
```

Faça login com:

```txt
gabriel@taskflow.dev
Taskflow@123
```

Crie ou mova uma tarefa no Kanban.

Em seguida, veja os logs do worker. Ao mover ou atribuir uma tarefa, o worker deve registrar `[EmailWorker][mail_sent]` (se `MAIL_ENABLED=true`) ou a simulação de envio.

---

## Fluxo principal para demonstração

1. Subir o projeto com `make up`
2. Acessar `http://localhost:3000`
3. Fazer login com usuário demo
4. Abrir o Kanban
5. Criar uma nova tarefa
6. Atribuir a tarefa a um usuário
7. Mover a tarefa entre colunas
8. Conferir o dashboard
9. Conferir os logs do worker processando notificações

---

## Trade-offs técnicos

- **Sem refresh token**: o token expira em 1 dia e exige novo login.
- **Token em localStorage**: simples para MVP; em produção, `HttpOnly cookie` seria mais seguro contra XSS.
- **Sem RBAC**: qualquer usuário autenticado pode editar ou excluir qualquer task.
- **Delete físico**: tarefas excluídas não vão para lixeira.
- **Notificações via Mailtrap**: o worker envia e-mails reais quando `MAIL_ENABLED=true`; sem essa flag, apenas loga a simulação. Substituível por qualquer SMTP sem alterar a arquitetura.
- **Sem WebSocket**: o Kanban não atualiza em tempo real entre vários usuários.
- **Dashboard simples**: possui agregações principais, mas ainda não compara períodos.
- **Migrations no boot**: facilita avaliação local; em produção, o ideal seria rodar migrations em etapa controlada de deploy.
- **Seed automático**: facilita demonstração; em produção, seeds de demo não deveriam rodar junto da aplicação.

---

## Observações finais

Este projeto foi estruturado como um MVP técnico para demonstrar uma aplicação fullstack funcional com backend modular, frontend integrado, banco relacional, fila assíncrona e worker separado.

A prioridade foi entregar um fluxo completo e fácil de executar localmente, mantendo espaço para evolução em segurança, permissões, observabilidade, testes e integrações reais de e-mail.
