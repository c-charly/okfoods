.PHONY: dev up down logs build lint format typecheck test images
dev:        ## Développement dans Docker (rechargement à chaud)
	docker compose -f docker-compose.dev.yml up --build
up:         ## Production locale dans Docker
	docker compose up --build -d
down:
	docker compose down
logs:
	docker compose logs -f web
build:      ## Image de production seule
	docker build --target runtime -t okfoods:latest .
lint:
	pnpm lint
format:
	pnpm format
typecheck:
	pnpm typecheck
test:
	pnpm test
images:     ## État des images attendues
	pnpm images:check
