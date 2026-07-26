# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Aplikasi manajemen komunitas **Fotang Daxin**: data umat, kelas, pendaftaran, blog/rangkuman, media. Publik melihat info kelas & blog; admin mengelola data via dashboard terautentikasi. Dokumentasi/ komentar dalam Bahasa Indonesia; identifier kode dalam Bahasa Inggris.

Status: Fase 1 (Scaffold) selesai. Roadmap dan rationale arsitektur ada di `docs/superpowers/specs/` dan `docs/superpowers/plans/`.

## Stack

Bun (runtime/PM/test runner), SvelteKit 2 + Svelte 5, Vite 8, Tailwind CSS v4 (CSS-first via `@tailwindcss/vite`), Hono 4 (API), Drizzle ORM + `postgres` (fase 2), better-auth (fase 3), Zod 4, pino, Biome 2 (lint/format), Playwright (E2E). Adapter: `@sveltejs/adapter-node`.

## Commands

```bash
bun install
bun run dev                 # http://localhost:5173
bun run build               # produksi (adapter-node)
bun run check               # svelte-kit sync + svelte-check (typecheck)
bun run lint                # biome check src tests
bun run format              # biome format --write src tests
bun run test                # bun test tests/unit
bun run test:e2e            # bunx playwright test (perlu: bunx playwright install chromium)
bun test tests/unit/api-health.test.ts   # jalankan satu file unit test
bun run db:gen | db:push | db:mig        # drizzle-kit (fase 2)
```

**Verification gate wajib sebelum mengklaim selesai:** `bun run check && bun run lint && bun run test`.

## Arsitektur Inti

### Mount Hono tunggal (pola paling penting)

Hono hanya berjalan server-side dan punya **satu titik mount otoritatif**:

1. `src/api/index.ts` — mendefinisikan `app` (instance Hono) dan mengekspor `handleApi(request)` yang memanggil `app.fetch(request)`. Route API ditulis di sini (dan nantinya di `src/api/modules/`).
2. `src/hooks.server.ts` — **satu-satunya** titik mount. Intercept `event.url.pathname.startsWith('/api/')` sebelum SvelteKit routing, lalu panggil `handleApi(event.request)`. Juga mengisi `event.locals.logger`.
3. `src/routes/api/[...path]/+server.ts` — forwarder defensif (GET/POST/PUT/PATCH/DELETE → `handleApi`). Normalnya di-shadow oleh hook; ada sebagai fallback & untuk type clarity.

**Aturan keras:** Kode Hono (`src/api/**`) tidak boleh bocor ke client bundle. Jangan import dari `src/api/**` di kode yang berjalan di browser.

### Struktur folder

- `src/api/` — route Hono (server-only).
- `src/lib/server/` — kode server-only: `env.ts` (validasi Zod di module-load), `logger.ts` (pino), `db.ts`/`r2.ts`/`auth.ts` (stub sampai fase masing-masing).
- `src/lib/shared/` — tipe & validator yang dipakai lintas client/server: `types.ts`, `validators/` (Zod).
- `src/routes/(public)/` — halaman publik (landing, info kelas, blog).
- `src/routes/(admin)/` — dashboard admin (akan dilindungi auth di fase 3).
- `src/routes/api/[...path]/` — forwarder ke `handleApi`.

### Pola stub

`db.ts`, `r2.ts`, `auth.ts` adalah stub yang melempar error "belum diimplementasikan" **saat dipanggil**, bukan saat di-import (tidak ada side-effect on import). Ini sengaja agar build/test lulus sementara fase berikutnya belum dimulai. Pertahankan pola ini saat menambah stub baru.

### App.Locals

Didefinisikan di `src/app.d.ts`: `App.Locals.logger: pino.Logger`. Diisi di `hooks.server.ts`.

### Validasi environment

`src/lib/server/env.ts` memvalidasi via Zod saat module load. Required: `NODE_ENV`, `PUBLIC_SITE_URL`. Lihat `.env.example` untuk variabel per-fase (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `R2_*`, `RESEND_API_KEY`).

## Konvensi

- TypeScript strict; `noUncheckedIndexedAccess` aktif. Tidak boleh `any` tanpa justifikasi.
- Biome: **tab indentation, single quotes, no semicolons** (`semicolons: "asNeeded"`), line width 100. Biome tidak memformat `*.svelte` (di-ignore).
- Validasi input pakai Zod, tempatkan di `src/lib/shared/validators`.
- PR per fase/modul, bukan satu PR raksasa.
- Komentar & docs dalam Bahasa Indonesia; identifier kode dalam Bahasa Inggris.

## Testing

- **Unit** (`tests/unit/*.test.ts`): `bun:test` — import `describe/it/expect` dari `bun:test`. Untuk tes Hono, import `app` langsung dari `src/api/index.ts` dan panggil `app.request(...)`.
- **E2E** (`tests/e2e/*.spec.ts`): Playwright, chromium-only, `baseURL: http://localhost:5173`, `webServer` auto-start `bun run dev`. Retries: 2 di CI, 0 lokal.
