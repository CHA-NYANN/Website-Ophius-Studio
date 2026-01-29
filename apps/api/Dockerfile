FROM node:20-alpine AS base

WORKDIR /app

# enable pnpm via corepack
RUN corepack enable

# Copy workspace manifests first for better docker cache
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

# Copy sources
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# Install (workspace)
RUN pnpm install

# Generate prisma client + build
RUN pnpm --filter @ophius-studio/api db:generate
RUN pnpm --filter @ophius-studio/api build

WORKDIR /app/apps/api

EXPOSE 3001

# In a real production setup you might run seeding once.
# For baseline convenience, we run migrate deploy + seed every start (seed is idempotent).
CMD sh -c "pnpm db:deploy && pnpm db:seed && pnpm start"
