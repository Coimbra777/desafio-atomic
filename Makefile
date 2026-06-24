up:
	docker compose up -d --build

down:
	docker compose down

reset:
	docker compose down -v

logs:
	docker compose logs -f api worker frontend

logs-api:
	docker compose logs -f api

logs-worker:
	docker compose logs -f worker

ps:
	docker compose ps

build:
	docker compose build

setup: up

api-shell:
	docker compose exec api sh

frontend-shell:
	docker compose exec frontend sh

migrate:
	docker compose exec api npm run migration:run

seed:
	@echo "Seed command will be added in a later etapa."

test:
	docker compose exec api npm run test
