.PHONY: start-development stop-development build-development deploy-frontend deploy-frontend-force

# Variables
# Usar nombre de proyecto explícito para evitar conflictos
DOCKER_COMPOSE_DEV = docker-compose -f docker/development/docker-compose.yml -p public_admin

start-development:
	$(DOCKER_COMPOSE_DEV) up -d

stop-development:
	$(DOCKER_COMPOSE_DEV) down

build-development:
	$(DOCKER_COMPOSE_DEV) build

deploy-frontend:
	@echo "🚀 Deploying to Netlify..."
	cd services/frontend && npx netlify-cli deploy --build --prod

deploy-frontend-force:
	@echo "🚀 Force deploying to Netlify..."
	cd services/frontend && npx netlify-cli deploy --build --prod --message "force-fresh-$$(date +%Y%m%d-%H%M%S)"

deploy-frontend-clean:
	@echo "🧹 Clean build and deploy..."
	cd services/frontend && rm -rf .next/ node_modules/.cache/ 2>/dev/null || true
	cd services/frontend && npm install
	cd services/frontend && npx netlify-cli deploy --build --prod --message "clean-deploy-$$(date +%Y%m%d-%H%M%S)"

# Limpiar caché de desarrollo (útil cuando HMR falla)
clean-frontend-cache:
	@echo "🧹 Stopping containers and cleaning cache..."
	$(DOCKER_COMPOSE_DEV) down
	@echo "Removing .next directory (may require sudo)..."
	sudo rm -rf services/frontend/.next services/frontend/node_modules/.cache 2>/dev/null || rm -rf services/frontend/.next services/frontend/node_modules/.cache 2>/dev/null || true
	@echo "✅ Cache cleaned. Now run: make start-development"

# Limpieza profunda (cuando HMR está completamente roto)
clean-frontend-deep:
	@echo "🧹 Deep cleaning (containers, cache, node_modules)..."
	$(DOCKER_COMPOSE_DEV) down -v
	@echo "Removing .next, node_modules/.cache, and Turbopack cache..."
	sudo rm -rf services/frontend/.next services/frontend/node_modules/.cache services/frontend/.turbo 2>/dev/null || true
	@echo "Rebuilding frontend container..."
	$(DOCKER_COMPOSE_DEV) build frontend
	@echo "✅ Deep clean complete. Now run: make start-development"

# Solo usar si hay problemas de permisos con .next/
deploy-frontend-sudo-clean:
	@echo "🧹 Deep clean (requiere sudo)..."
	sudo rm -rf services/frontend/.next/ services/frontend/node_modules/.cache/ 2>/dev/null || true
	cd services/frontend && npm install
	cd services/frontend && npx netlify-cli deploy --build --prod
