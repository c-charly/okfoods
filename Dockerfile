# syntax=docker/dockerfile:1.7
#
# OK Foods — image de production Nuxt 4 / Nitro (preset node-server).
# AUCUN serveur web (nginx, Caddy…) : Dokploy / Traefik s'occupe du TLS et du reverse-proxy.
#
# Cibles :
#   dev      → serveur de développement (pnpm dev --host 0.0.0.0), à utiliser avec docker-compose.dev.yml
#   runtime  → image finale minimale (cible par défaut, la dernière du fichier)
#
# La version de pnpm vient UNIQUEMENT du champ « packageManager » de package.json.
# Node 24 (LTS). Corepack n'est plus livré avec Node ≥ 25 : pnpm est donc installé via npm,
# à la version exacte déclarée (même résultat, indépendant de la version de Node).

ARG NODE_VERSION=24

# ───────────────────────── base : Node + pnpm ─────────────────────────
FROM node:${NODE_VERSION}-alpine AS base
ENV NUXT_TELEMETRY_DISABLED=1 \
    CI=true
WORKDIR /app
COPY package.json ./
RUN PNPM_VERSION="$(node -p "require('./package.json').packageManager.replace(/^pnpm@/, '').split('+')[0]")" \
 && npm install -g "pnpm@${PNPM_VERSION}" \
 && pnpm --version

# ───────────────────────── deps : dépendances (cache pnpm) ─────────────────────────
FROM base AS deps
# pnpm-workspace.yaml est INDISPENSABLE : il autorise les scripts de build (esbuild…) sous pnpm ≥ 10
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

# ───────────────────────── dev : serveur de développement ─────────────────────────
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# ───────────────────────── build : compilation Nitro ─────────────────────────
FROM deps AS build
ENV NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=3072
COPY . .
RUN pnpm build

# ───────────────────────── runtime : image finale ─────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production \
    NUXT_TELEMETRY_DISABLED=1 \
    HOST=0.0.0.0 \
    PORT=3000
WORKDIR /app

# Seul le résultat de la compilation est copié (pas de node_modules, pas de sources).
COPY --from=build --chown=node:node /app/.output ./.output

# @nuxt/content ouvre sa base SQLite au démarrage (dans .output/server, ou .data selon la configuration) :
# l'utilisateur non-root `node` doit donc pouvoir écrire dans /app.
RUN mkdir -p /app/.data && chown -R node:node /app
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
