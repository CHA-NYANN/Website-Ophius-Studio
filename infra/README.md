# Deployment baseline (Postgres + cookies + CORS)

Folder `infra/` ini ngunci fondasi deployment: database PostgreSQL, konfigurasi cookie aman untuk production, serta CORS/origin allowlist yang ketat.

Kalau kamu mau mode “prod-like” lokal, file `docker-compose.prod.yml` bakal jalanin tiga service: `db` (Postgres), `api` (Fastify + Prisma + migrate deploy + seed), dan `web` (Nginx serve React build + proxy `/api` dan `/uploads` ke service API). Dengan pola ini, browser akses web di `http://localhost:8080` dan request API tetap same-origin (`/api`), jadi session cookie lebih gampang dan tidak perlu `SameSite=None`.

Kalau kamu mau tetap develop di host (pnpm), file `docker-compose.dev.yml` hanya nyalain Postgres. Setelah itu kamu bisa jalankan `pnpm --filter @ophius-studio/api db:deploy` lalu `pnpm --filter @ophius-studio/api db:seed` dan `pnpm dev` seperti biasa.

Catatan untuk Windows: port Postgres default sering dipakai project lain di `5432`, jadi compose di repo ini memakai host port `5433` secara default. Kamu bisa override dengan membuat `DB_PORT=5433` (atau port lain) di `.env`, karena compose memakai pola `${DB_PORT:-5433}`.
