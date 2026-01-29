FROM node:20-alpine AS builder

WORKDIR /app
RUN corepack enable

# Manifests (workspace)
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

# Sources
COPY apps/web ./apps/web

RUN pnpm install
RUN pnpm --filter @ophius-studio/web build

FROM nginx:alpine

COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
