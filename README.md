# Ophius Studio (Local Run)

Repo ini sudah diset supaya aman di Windows yang port 5432-nya sering bentrok. Default Postgres untuk project ini memakai **host port 5433** (lihat `infra/docker-compose.dev.yml`). Kalau kamu mau ganti port, cukup ubah `DB_PORT` dan `DATABASE_URL`.

## Prasyarat

Docker Desktop harus aktif, dan Node.js + pnpm terpasang.

## Jalankan mode develop (paling enak untuk ngoding)

Dari root repo:

```bash
pnpm install

docker compose -f infra/docker-compose.dev.yml up -d

pnpm --filter @ophius-studio/api db:deploy
pnpm --filter @ophius-studio/api db:generate
pnpm --filter @ophius-studio/api db:seed

pnpm dev
```

Web biasanya di `http://localhost:5173` dan API di `http://localhost:3001`. Login admin default: `admin / admin` (lihat env di `.env` dan `apps/api/.env`).

## Black hole realistic (3D asset)

Repo ini bisa memakai **model 3D** untuk black hole (lebih artistik + umumnya lebih ringan dibanding shader/FBO).

1) Export file Blender:
- Sumber: `_assets/realistic-black-hole/black_hole_project.blend`
- Target hasil export: `apps/web/public/models/blackhole/blackhole.glb`

2) Setelah file `blackhole.glb` ada, web akan **otomatis** memakai model tersebut.
Kalau belum ada, web fallback ke black hole procedural.

Lihat panduan lengkap di:
- `apps/web/public/models/blackhole/README.md`

Shortcut export (butuh Blender terinstall):

```bash
# Linux/macOS
./scripts/export-blackhole.sh
```

```bat
:: Windows
scripts\export-blackhole.bat
```

## Catatan port

Kalau kamu melihat error “port is already allocated”, itu berarti port host yang dipakai sudah dipakai proses lain. Di project ini, defaultnya sudah dipindah ke 5433 supaya tidak bentrok dengan Postgres lain yang umum ada di 5432.
