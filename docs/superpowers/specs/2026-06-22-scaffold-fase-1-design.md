# Spec: Fase 1 — Scaffold (Website Fotang Daxin)

- **Issue sumber:** [#2 — Website Fotang Daxin, Perencanaan Implementasi](https://github.com/juliusHin/website-fotang-daxin/issues/2)
- **Fase roadmap:** #1 Scaffold
- **Tanggal:** 2026-06-22
- **Status:** Approved (menunggu review spec)

## 1. Tujuan

Membangun fondasi proyek yang dapat di-build, di-test, dan di-run, mengikuti stack & arsitektur yang didefinisikan issue #2. Fondasi ini mencakup SvelteKit + Bun + Tailwind v4 + Hono (ter-mount), struktur folder sesuai zona kerja issue, TypeScript strict, Biome, dan harness testing (bun test + Playwright). **Semua** dependency (backend, frontend, media, opsional) dipasang di fase ini agar fase berikutnya tinggal mengonfigurasi; namun DB, Auth, R2, dsb. **belum** diimplementasikan — hanya stub yang melempar pesan "belum diimplementasikan" bila dipanggil.

## 2. Non-Tujuan (di luar scope)

- Schema Drizzle, koneksi DB nyata, migrasi → **Fase 2 (Database)**.
- better-auth terkonfigurasi, proteksi route `(admin)`, login UI → **Fase 3 (Auth)**.
- Implementasi modul (Umat, Kelas, Pendaftaran, Blog, Media), editor Tiptap, upload R2 nyata, import CSV, qrcode check-in → fase modul masing-masing.

## 3. Stack & Versi

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Runtime / package manager / test runner | Bun 1.3.x | Semua perintah via `bun` |
| Framework | SvelteKit 2.x + Vite | adapter `@sveltejs/adapter-node` (kompatibel deploy Bun-native VPS) |
| Styling | Tailwind CSS v4 | plugin `@tailwindcss/vite`; config CSS-first; entry `src/app.css` |
| API | Hono (latest) | di-mount server-side via `hooks.server.ts` |
| Bahasa | TypeScript strict | `strict: true`, `noUncheckedIndexedAccess: true` |
| Lint / format | Biome | single tool; perintah `lint` & `format` |
| Test unit | `bun test` | |
| Test e2e | `@playwright/test` | |

## 4. Pendekatan Bootstrap

**A1 — `sv create` (base) + layering manual.** Gunakan CLI resmi SvelteKit secara non-interaktif untuk menghasilkan base SvelteKit + Bun + TS + adapter-node yang benar, lalu tambahkan Tailwind v4, mount Hono, Biome, deps, struktur folder, dan testing secara manual di atasnya. Pendekatan ini reproducible dan meminimalkan risiko config.

Dipilih ketimbang:
- A2 `sv create` + add-ons resmi (interaktif, konflik dgn custom mount Hono, versi tak terkontrol).
- A3 manual murni (rawan config error).

## 5. Struktur Folder (hasil akhir)

```
.
├── .env.example
├── .gitignore
├── AGENTS.md                  ← perintah dev/build/test/lint untuk opencode
├── README.md
├── biome.json
├── bunfig.toml
├── drizzle.config.ts          ← minimal placeholder (aktif fase 2)
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── vite.config.ts             ← plugin sveltekit + @tailwindcss/vite
├── static/favicon.png
├── src/
│   ├── app.d.ts               ← tipe App.Locals
│   ├── app.html
│   ├── app.css                ← @import "tailwindcss";
│   ├── hooks.server.ts        ← MOUNT Hono utama
│   ├── api/
│   │   ├── index.ts           ← Hono app + handleApi(request) + GET /api/health
│   │   └── modules/.gitkeep
│   ├── lib/
│   │   ├── server/
│   │   │   ├── env.ts         ← validasi env via Zod
│   │   │   ├── logger.ts      ← pino instance
│   │   │   ├── db.ts          ← stub
│   │   │   ├── r2.ts          ← stub
│   │   │   └── auth.ts        ← stub
│   │   └── shared/
│   │       ├── types.ts
│   │       └── validators/.gitkeep
│   └── routes/
│       ├── (public)/
│       │   ├── +layout.svelte
│       │   └── +page.svelte   ← landing minimal
│       ├── (admin)/
│       │   ├── +layout.svelte ← placeholder; dilindungi fase auth
│       │   └── +page.svelte
│       └── api/[...path]/+server.ts   ← forwarder defensif
├── tests/
│   ├── unit/api-health.test.ts
│   └── e2e/smoke.spec.ts
└── drizzle/                   ← output migrasi fase 2 (.gitkeep)
```

## 6. Pola Mount Hono

Satu-satunya logika mount ada di `hooks.server.ts`. Aplikasi Hono dan handlernya diekspor dari `src/api/index.ts`.

- **`src/api/index.ts`**
  - `export const app = new Hono()`.
  - Daftarkan `app.get('/api/health', ...)` → `200 { ok: true, service: 'website-fotang-daxin', ts: <ISO string> }`.
  - `export async function handleApi(request: Request): Promise<Response>` — membungkus `app.fetch(request)`.
- **`src/hooks.server.ts`** (mount utama & otoritatif)
  - `export const handle: Handle = async ({ event, resolve }) => { ... }`.
  - Bila `event.url.pathname.startsWith('/api/')`: set `event.locals` (logger pino, dsb.), lalu `return await handleApi(event.request)`.
  - Selebihnya: `return await resolve(event)`.
- **`src/routes/api/[...path]/+server.ts`** (forwarder defensif tipis)
  - Export `GET | POST | PUT | PATCH | DELETE` yang masing-masing `return handleApi(event.request)`.
  - Karena `hooks.handle` berjalan **sebelum** routing, route ini normalnya ter-shadow oleh hook. Hadir sebagai fallback tahan-banting & untuk kejelasan tipe; **tidak** memuat logika bisnis apa pun — hanya delegasi ke handler yang sama.

> Racional: Memenuhi prinsip issue "hooks.server.ts adalah satu-satunya titik mount Hono" sekaligus tetap menyediakan `+server.ts` forwarder yang disebut dalam arsitektur issue, tanpa menggandakan logika.

### Prinsip kunci (dari issue) yang diterapkan

- Kode Hono (`src/api/**`) tidak boleh bocor ke client bundle. Verifikasi: setelah `vite build`, direktori `.sveltekit/output/client` bebas token `hono`.
- `hooks.server.ts` adalah satu-satunya titik logika mount Hono.

## 7. Endpoint

| Method | Path | Respon |
|---|---|---|
| GET | `/api/health` | `200 { ok: true, service: "website-fotang-daxin", ts: <ISO> }` |

## 8. Dependencies (semua dipasang, belum dikonfigurasi)

### Backend
`hono`, `drizzle-orm`, `postgres`, `zod`, `better-auth`, `@node-rs/argon2`, `jose`, `pino`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `sharp`, `nanoid`, `dayjs`, `resend`, `qrcode`, `papaparse`, `@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/pm`

### Frontend
`tailwindcss`, `@tailwindcss/vite`, `@tanstack/svelte-query`, `@tanstack/svelte-table`, `sveltekit-superforms`, `lucide-svelte` (`zod` sudah dicantumkan di Backend)

### Dev
`@sveltejs/adapter-node`, `@sveltejs/kit`, `@sveltejs/vite-plugin-svelte`, `svelte`, `svelte-check`, `typescript`, `vite`, `@biomejs/biome`, `@playwright/test`, `drizzle-kit`, `@types/papaparse`, `@types/qrcode`

### Catatan teknis
- better-auth mengirim hashing password bawaan (scrypt); `@node-rs/argon2` disiapkan untuk opsi upgrade di fase Auth tanpa memerlukan kompilasi native.
- Nama paket Tiptap dan adapter Svelte untuk TanStack dikonfirmasi ke versi terbaru saat `bun add`. `@tanstack/svelte-query` & `@tanstack/svelte-table` adalah nama paket resmi untuk Svelte.

## 9. Env & Validasi

### `.env.example`

```
NODE_ENV=development
PUBLIC_SITE_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/fotang_daxin
BETTER_AUTH_SECRET=change-me
BETTER_AUTH_URL=http://localhost:5173
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
RESEND_API_KEY=
LOG_LEVEL=info
```

### `src/lib/server/env.ts`
- Memakai Zod untuk mem-parsing `process.env` saat modul diimpor.
- `required`: `NODE_ENV`, `PUBLIC_SITE_URL`.
- Selebihnya `optional` (dipakai saat fasenya tiba).
- Bila required missing → throw `Error` dengan daftar field yang hilang.

### `.gitignore`
`node_modules`, `.env`, `.env.*`(kecuali `.env.example`), `build/`, `.svelte-kit/`, `.DS_Store`, `test-results/`, `playwright-report/`, `playwright/.cache/`, `*.log`. (`drizzle/` **tidak** di-ignore — migrasi di-commit mulai fase 2.)

## 10. Konfigurasi Lain

### `bunfig.toml`
- Konfigurasi minimal untuk `bun test` (path `tests/**`). Tidak wajib `preload` di fase ini.

### `tsconfig.json`
- `strict: true`, `noUncheckedIndexedAccess: true`. Mengikuti extends default hasil `sv create`.

### `vite.config.ts`
- `import { sveltekit } from '@sveltejs/kit/vite'`, `import tailwindcss from '@tailwindcss/vite'`.
- `plugins: [tailwindcss(), sveltekit()]`.

### `biome.json`
- `recommended: true`; `formatter.indentStyle: tab` (default Biome); include `src`, `tests`; ignore `.svelte-kit`, `build`.

### `drizzle.config.ts`
- Placeholder: `schema = './src/lib/server/schema'` (folder belum ada — di-fase 2), `out = './drizzle'`, `dialect = 'postgresql'`, baca `DATABASE_URL` dari env. **Tidak** digenerate migrasi di fase ini.

### `playwright.config.ts`
- `webServer: { command: 'bun run dev', port: 5173, reuseExistingServer: !CI }`.
- `testDir: './tests/e2e'`.
- Base URL `http://localhost:5173`.

## 11. Testing

### Unit (`bun test`)
- `tests/unit/api-health.test.ts`: impor `app` dari `src/api/index.ts`, panggil `app.request('/api/health')`, assert status 200 dan `body.ok === true`.

### E2E (Playwright)
- `tests/e2e/smoke.spec.ts`:
  - Kunjungi homepage, assert heading "Fotang Daxin" terlihat.
  - `request.get('/api/health')`, assert status 200 dan JSON `ok === true`.

## 12. Scripts (`package.json`)

```
dev        vite dev
build      vite build
preview    vite preview
check      svelte-kit sync && svelte-check --tsconfig ./tsconfig.json
lint       biome check src tests
format     biome format --write src tests
test       bun test
test:e2e   bunx playwright test
db:gen     drizzle-kit generate
db:push    drizzle-kit push
db:mig     drizzle-kit migrate
```

## 13. UI Shell (minimal)

- `src/routes/(public)/+layout.svelte`: kerangka halaman (header dengan nama komunitas + slot konten), kelas Tailwind.
- `src/routes/(public)/+page.svelte`: hero sederhana — judul "Fotang Daxin", subjudul, dan tautan ke `/admin` (placeholder).
- `src/routes/(admin)/+layout.svelte` & `+page.svelte`: placeholder teks "Dashboard — akan tersedia setelah fase Auth". Belum dilindungi.
- `src/app.d.ts`: tipe `App.Locals` (`logger`, dsb. sesuai kebutuhan hooks).

## 14. AGENTS.md & README

- `AGENTS.md` (root): dokumentasi perintah `dev/build/check/lint/test/test:e2e` beserta catatan stack, agar opencode tahu cara verifikasi. (Ditambahkan sesuai anjuran workflow opencode.)
- `README.md`: deskripsi singkat proyek, prasyarat (Bun, Node), cara setup (salin `.env.example`, `bun install`, `bun run dev`), dan status fase.

## 15. Definition of Done (verification gate)

1. `bun install` bersih tanpa error.
2. `bun run check` lulus — svelte-check, 0 error TS.
3. `bun run lint` lulus — Biome.
4. `bun run build` sukses **dan** tidak ada kode Hono/api di client bundle (verifikasi: `.sveltekit/output/client` bebas token `hono`).
5. `bun test` lulus — health unit test.
6. `bun run test:e2e` lulus — smoke test.
7. `bun run dev` berjalan; `GET http://localhost:5173/api/health` mengembalikan 200 + body yang benar.

## 16. Risiko & Catatan

- **Native deps** (`@node-rs/argon2`, `sharp`): keduanya mengirim prebuilt binary sehingga kompatibel dengan Bun tanpa toolchain build. Jika satu paket gagal pada arsitektur tertentu, dicatat & di-skip dengan catatan (tidak memblokir scaffold).
- **Konflik `sv create` interaktif**: gunakan flag non-interaktif (mis. template minimal) supaya dapat diproduksi ulang oleh plan.
- **Tailwind v4**: konfigurasi CSS-first (tanpa `tailwind.config.js` legacy); jika plugin versi minor berperilaku berbeda, disesuaikan saat implementasi.
- **Stub yang melempar**: stub `db.ts`, `r2.ts`, `auth.ts` hanya diekspor sebagai fungsi/objek yang melempar `Error('[fase X] belum diimplementasikan')` bila dipanggil — tidak boleh memicu side-effect saat import (agar build/test tidak gagal).
