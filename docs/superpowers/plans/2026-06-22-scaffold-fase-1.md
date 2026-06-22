# Fase 1 — Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun fondasi proyek Website Fotang Daxin (SvelteKit + Bun + Tailwind v4 + Hono ter-mount) yang bisa di-build, di-test, dan di-run, dengan seluruh dependency terpasang dan harness testing siap pakai.

**Architecture:** Bootstrap via CLI resmi SvelteKit (`sv create`) ke direktori sementara, lalu rsync ke root proyek (menyimpan `docs/` dan `.git`). Hono di-mount otoritatif di `src/hooks.server.ts` dengan satu instance `app` di `src/api/index.ts`; `src/routes/api/[...path]/+server.ts` adalah forwarder defensif tipis. Semua dep backend/frontend/media dipasang tapi belum dikonfigurasi (stub). Testing: `bun test` (unit, scoped ke `tests/unit`) + Playwright (e2e di `tests/e2e`).

**Tech Stack:** Bun 1.3.x, SvelteKit 2.x, adapter-node, Tailwind v4 (`@tailwindcss/vite`), Hono, TypeScript strict, Biome, Playwright.

**Spec sumber:** `docs/superpowers/specs/2026-06-22-scaffold-fase-1-design.md`

---

## Daftar Task

1. Bootstrap SvelteKit base
2. Install semua dependency
3. Konfigurasi TypeScript strict
4. Konfigurasi Tailwind v4 + root layout (global CSS)
5. Konfigurasi adapter-node + vite.config.ts
6. Konfigurasi Biome
7. Env, .env.example, .gitignore
8. Logger pino + stub server (db/r2/auth) + shared placeholders
9. Hono app + endpoint `/api/health` (TDD)
10. Mount Hono di hooks.server.ts + app.d.ts + forwarder +server.ts
11. App shell UI (public & admin)
12. Playwright config + e2e smoke test
13. Scripts package.json + bunfig.toml + drizzle.config.ts + folder .gitkeep
14. AGENTS.md + README.md
15. Verification gate (DoD) + bundle leak check + commit final

---

### Task 1: Bootstrap SvelteKit Base

**Files:**
- Create: `package.json`, `svelte.config.js`, `vite.config.js` (akan diganti di Task 5), `tsconfig.json` (akan diganti di Task 3), `src/app.html`, `src/routes/+page.svelte` (akan dihapus), `static/`, `.gitignore`, `README.md` (akan diganti di Task 14)

- [ ] **Step 1: Buat base SvelteKit di direktori sementara (non-interaktif)**

Run (dari root proyek):
```bash
rm -rf /tmp/opencode/sv-bootstrap
bunx sv create /tmp/opencode/sv-bootstrap --template minimal --types ts --no-add-ons --no-install
```
Expected: direktori `/tmp/opencode/sv-bootstrap` berisi `package.json`, `svelte.config.js`, `vite.config.*`, `tsconfig.json`, `src/app.html`, `src/routes/+page.svelte`, `static/`, `.gitignore`.

- [ ] **Step 2: rsync isi base ke root proyek (tanpa menimpa `docs/` & `.git`)**

Run:
```bash
rsync -a --exclude='.git' --exclude='node_modules' /tmp/opencode/sv-bootstrap/ ./
```
Expected: file-file SvelteKit muncul di root; `docs/` dan `.git` tetap utuh.

- [ ] **Step 3: Hapus halaman/layout root bawaan (akan diganti route groups)**

Run:
```bash
rm -f src/routes/+page.svelte src/routes/+layout.svelte
```
Expected: kedua file hilang (mencegah konflik path `/` dengan grup `(public)`).

- [ ] **Step 4: Ganti nama package**

Edit `package.json`: ubah field `"name"` menjadi `"website-fotang-daxin"`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: bootstrap SvelteKit base via sv create"
```

---

### Task 2: Install Semua Dependency

**Files:**
- Modify: `package.json`, `bun.lock`

- [ ] **Step 1: Pasang dependency runtime (backend + frontend)**

Run:
```bash
bun add hono drizzle-orm postgres zod better-auth @node-rs/argon2 jose pino @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp nanoid dayjs resend qrcode papaparse @tiptap/core @tiptap/starter-kit @tiptap/pm tailwindcss @tailwindcss/vite @tanstack/svelte-query @tanstack/svelte-table sveltekit-superforms lucide-svelte
```
Expected: semua paket terpasang. Jika satu nama paket tidak ditemukan (mis. adapter Svelte TanStack/Tiptap berubah versi), catat dan lanjut — tidak memblokir scaffold (sesuai spec §16).

- [ ] **Step 2: Pasang dependency dev**

Run:
```bash
bun add -d @sveltejs/adapter-node @biomejs/biome @playwright/test drizzle-kit @types/papaparse @types/qrcode
```
Expected: paket dev terpasang.

- [ ] **Step 3: Lepas adapter-auto bawaan (diganti adapter-node)**

Run:
```bash
bun remove @sveltejs/adapter-auto 2>/dev/null || true
```
Expected: jika sebelumnya ada, dihapus; jika tidak ada, perintah no-op.

- [ ] **Step 4: Verifikasi instalasi**

Run:
```bash
bun install
```
Expected: selesai tanpa error; `node_modules` terbentuk.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: install all runtime & dev dependencies"
```

---

### Task 3: Konfigurasi TypeScript Strict

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Tulis `tsconfig.json` (strict + noUncheckedIndexedAccess)**

Tulis isi `tsconfig.json`:
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "noUncheckedIndexedAccess": true
  }
}
```

- [ ] **Step 2: Sinkronkan & cek**

Run:
```bash
bunx svelte-kit sync
```
Expected: `.svelte-kit/tsconfig.json` terbuat; tidak ada error.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: enable typescript strict + noUncheckedIndexedAccess"
```

---

### Task 4: Konfigurasi Tailwind v4 + Root Layout (Global CSS)

**Files:**
- Create: `src/app.css`
- Create: `src/routes/+layout.svelte`

- [ ] **Step 1: Buat entry CSS Tailwind v4**

Tulis `src/app.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 2: Buat root layout yang mengimpor CSS global**

Tulis `src/routes/+layout.svelte`:
```svelte
<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

{@render children()}
```

- [ ] **Step 3: Commit**

```bash
git add src/app.css src/routes/+layout.svelte
git commit -m "feat(ui): add tailwind v4 entry and root layout"
```

---

### Task 5: Konfigurasi adapter-node + vite.config.ts

**Files:**
- Create: `vite.config.ts`
- Modify: `svelte.config.js`
- Delete: `vite.config.js` (jika ada bawaan)

- [ ] **Step 1: Ganti `svelte.config.js` agar memakai adapter-node**

Tulis `svelte.config.js`:
```js
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};

export default config;
```

- [ ] **Step 2: Tulis `vite.config.ts` dengan plugin Tailwind + SvelteKit**

Tulis `vite.config.ts`:
```ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
});
```

- [ ] **Step 3: Hapus `vite.config.js` bawaan jika ada**

Run:
```bash
rm -f vite.config.js
```
Expected: file `.js` hilang (diganti `.ts`).

- [ ] **Step 4: Verifikasi dev server start (smoke)**

Run:
```bash
timeout 8 bun run dev || true
```
Expected: log Vite/SvelteKit muncul tanpa error konfigurasi (proses dihentikan oleh `timeout`).

- [ ] **Step 5: Commit**

```bash
git add vite.config.ts svelte.config.js
git commit -m "build: configure adapter-node and vite (sveltekit + tailwindcss)"
```

---

### Task 6: Konfigurasi Biome

**Files:**
- Create: `biome.json`

- [ ] **Step 1: Tulis `biome.json`**

Tulis `biome.json`:
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": { "enabled": false, "clientKind": "git", "useIgnoreFile": true },
  "files": {
    "ignoreUnknown": true,
    "ignore": [".svelte-kit", "build", "drizzle", "playwright-report", "test-results"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "javascript": {
    "formatter": { "quoteStyle": "single", "semicolons": "asNeeded" }
  }
}
```

- [ ] **Step 2: Verifikasi Biome jalan**

Run:
```bash
bunx biome check src tests 2>&1 | tail -5 || true
```
Expected: Biome berjalan (mungkin ada pelanggaran gaya pada file bawaan — akan dirapikan nanti via `format`).

- [ ] **Step 3: Commit**

```bash
git add biome.json
git commit -m "chore: add biome lint/format config"
```

---

### Task 7: Env, .env.example, .gitignore

**Files:**
- Create: `.env.example`
- Create: `src/lib/server/env.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Tulis `.env.example`**

Tulis `.env.example`:
```
NODE_ENV=development
PUBLIC_SITE_URL=http://localhost:5173
LOG_LEVEL=info

# Fase 2 (Database)
DATABASE_URL=postgresql://user:password@localhost:5432/fotang_daxin

# Fase 3 (Auth)
BETTER_AUTH_SECRET=change-me
BETTER_AUTH_URL=http://localhost:5173

# Fase Media (R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=

# Opsional
RESEND_API_KEY=
```

- [ ] **Step 2: Salin ke `.env` aktif (untuk dev lokal)**

Run:
```bash
cp .env.example .env
```
Expected: `.env` dibuat dengan nilai contoh.

- [ ] **Step 3: Pastikan `.gitignore` memuat aturan yang benar**

Periksa `.gitignore`; pastikan memuat (tambahkan jika kurang):
```
node_modules
/build
/.svelte-kit
/.env
/.env.*
!.env.example
.DS_Store
/test-results
/playwright-report
/playwright/.cache
*.log
```

- [ ] **Step 4: Tulis validator env dengan Zod**

Tulis `src/lib/server/env.ts`:
```ts
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PUBLIC_SITE_URL: z.string().url(),
  LOG_LEVEL: z.string().default('info'),

  DATABASE_URL: z.string().optional(),
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
});

function load() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment variables: ${issues}`);
  }
  return parsed.data;
}

export const env = load();
```

- [ ] **Step 5: Commit**

```bash
git add .env.example src/lib/server/env.ts .gitignore
git commit -m "feat(config): add env validation and env example"
```

---

### Task 8: Logger pino + Stub Server + Shared Placeholders

**Files:**
- Create: `src/lib/server/logger.ts`
- Create: `src/lib/server/db.ts`
- Create: `src/lib/server/r2.ts`
- Create: `src/lib/server/auth.ts`
- Create: `src/lib/shared/types.ts`
- Create: `src/lib/shared/validators/.gitkeep`
- Create: `src/api/modules/.gitkeep`

- [ ] **Step 1: Logger pino**

Tulis `src/lib/server/logger.ts`:
```ts
import pino from 'pino';
import { env } from './env';

export const logger = pino({ level: env.LOG_LEVEL });
```

- [ ] **Step 2: Stub `db` (Fase 2)**

Tulis `src/lib/server/db.ts`:
```ts
/** Placeholder — diimplementasikan di Fase 2 (Database). */
export function getDb(): never {
  throw new Error('[Fase 2 — Database] belum diimplementasikan');
}
```

- [ ] **Step 3: Stub `r2` (Fase Media)**

Tulis `src/lib/server/r2.ts`:
```ts
/** Placeholder — diimplementasikan di Fase Media. */
export function getR2(): never {
  throw new Error('[Fase Media] R2 client belum diimplementasikan');
}
```

- [ ] **Step 4: Stub `auth` (Fase Auth)**

Tulis `src/lib/server/auth.ts`:
```ts
/** Placeholder — diimplementasikan di Fase Auth (better-auth). */
export function getAuth(): never {
  throw new Error('[Fase Auth] better-auth belum diimplementasikan');
}
```

- [ ] **Step 5: Shared types & placeholder folders**

Tulis `src/lib/shared/types.ts`:
```ts
/** Tipe shared antara frontend & backend. */
export type ServiceInfo = {
  ok: boolean;
  service: string;
  ts: string;
};
```

Buat `.gitkeep`:
```bash
mkdir -p src/lib/shared/validators src/api/modules
touch src/lib/shared/validators/.gitkeep src/api/modules/.gitkeep
```

- [ ] **Step 6: Verifikasi stub tidak punya side-effect saat import**

Run:
```bash
bun -e "import('./src/lib/server/db.ts').then(m => console.log('db import ok', typeof m.getDb))"
```
Expected: mencetak `db import ok function` (tanpa melempar, karena fungsi belum dipanggil).

- [ ] **Step 7: Commit**

```bash
git add src/lib/server/logger.ts src/lib/server/db.ts src/lib/server/r2.ts src/lib/server/auth.ts src/lib/shared/types.ts src/lib/shared/validators/.gitkeep src/api/modules/.gitkeep
git commit -m "feat(core): add pino logger, server stubs, and shared placeholders"
```

---

### Task 9: Hono App + Endpoint `/api/health` (TDD)

**Files:**
- Create: `tests/unit/api-health.test.ts`
- Create: `src/api/index.ts`

- [ ] **Step 1: Tulis unit test yang gagal**

Buat `tests/unit/api-health.test.ts`:
```ts
import { describe, expect, it } from 'bun:test';
import { app } from '../../src/api/index';

describe('GET /api/health', () => {
  it('returns ok status and service name', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe('website-fotang-daxin');
    expect(typeof body.ts).toBe('string');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal (modul belum ada)**

Run:
```bash
bun test tests/unit
```
Expected: FAIL dengan error resolve module `../../src/api/index` (file belum ada).

- [ ] **Step 3: Implementasi Hono app + handler**

Tulis `src/api/index.ts`:
```ts
import { Hono } from 'hono';

export const app = new Hono();

app.get('/api/health', (c) => {
  return c.json({
    ok: true,
    service: 'website-fotang-daxin',
    ts: new Date().toISOString(),
  });
});

/** Titik delegasi tunggal yang dipakai hooks.server.ts & forwarder. */
export async function handleApi(request: Request): Promise<Response> {
  return app.fetch(request);
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run:
```bash
bun test tests/unit
```
Expected: PASS — `1 pass (1)`.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/api-health.test.ts src/api/index.ts
git commit -m "feat(api): add hono app with /api/health endpoint"
```

---

### Task 10: Mount Hono di hooks.server.ts + app.d.ts + Forwarder

**Files:**
- Create: `src/hooks.server.ts`
- Modify: `src/app.d.ts`
- Create: `src/routes/api/[...path]/+server.ts`

- [ ] **Step 1: Tulis `src/hooks.server.ts` (mount otoritatif)**

Tulis `src/hooks.server.ts`:
```ts
import type { Handle } from '@sveltejs/kit';
import { handleApi } from './api';
import { logger } from './lib/server/logger';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.logger = logger;

  if (event.url.pathname.startsWith('/api/')) {
    return await handleApi(event.request);
  }

  return await resolve(event);
};
```

- [ ] **Step 2: Perbarui `src/app.d.ts` dengan tipe Locals**

Tulis `src/app.d.ts`:
```ts
import type { Logger } from 'pino';

declare global {
  namespace App {
    interface Locals {
      logger: Logger;
    }
    interface Error {}
    interface PageData {}
    interface PageState {}
  }
}

export {};
```

- [ ] **Step 3: Tulis forwarder defensif `src/routes/api/[...path]/+server.ts`**

Tulis `src/routes/api/[...path]/+server.ts`:
```ts
import type { RequestHandler } from './$types';
import { handleApi } from '../../../api';

const forward: RequestHandler = ({ request }) => handleApi(request);

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
```

- [ ] **Step 4: Cek tipe**

Run:
```bash
bunx svelte-kit sync && bun run check
```
Expected: 0 error. (Jika `bun run check` belum didefinisikan di `package.json`, lewati step ini — scripts ditambahkan di Task 13; jalankan ulang check setelah Task 13.)

- [ ] **Step 5: Commit**

```bash
git add src/hooks.server.ts src/app.d.ts 'src/routes/api/[...path]/+server.ts'
git commit -m "feat(api): mount hono in hooks.server.ts with defensive forwarder"
```

---

### Task 11: App Shell UI (Public & Admin)

**Files:**
- Create: `src/routes/(public)/+layout.svelte`
- Create: `src/routes/(public)/+page.svelte`
- Create: `src/routes/(admin)/+layout.svelte`
- Create: `src/routes/(admin)/+page.svelte`

- [ ] **Step 1: Layout grup publik**

Tulis `src/routes/(public)/+layout.svelte`:
```svelte
<script lang="ts">
  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
  <header class="border-b">
    <nav class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="/" class="font-semibold">Fotang Daxin</a>
      <div class="flex gap-4 text-sm">
        <a href="/">Beranda</a>
        <a href="/admin">Admin</a>
      </div>
    </nav>
  </header>
  <main class="flex-1">{@render children()}</main>
</div>
```

- [ ] **Step 2: Landing publik**

Tulis `src/routes/(public)/+page.svelte`:
```svelte
<svelte:head>
  <title>Fotang Daxin</title>
</svelte:head>

<section class="max-w-5xl mx-auto px-4 py-20 text-center">
  <h1 class="text-4xl font-bold">Fotang Daxin</h1>
  <p class="mt-4 text-lg text-gray-600">
    Manajemen komunitas, kelas, dan data umat.
  </p>
</section>
```

- [ ] **Step 3: Layout admin (placeholder)**

Tulis `src/routes/(admin)/+layout.svelte`:
```svelte
<script lang="ts">
  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
  <header class="border-b">
    <div class="max-w-5xl mx-auto px-4 py-3 font-semibold">Dashboard Admin</div>
  </header>
  <main class="flex-1">{@render children()}</main>
</div>
```

- [ ] **Step 4: Halaman admin (placeholder)**

Tulis `src/routes/(admin)/+page.svelte`:
```svelte
<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<section class="max-w-5xl mx-auto px-4 py-12">
  <h1 class="text-2xl font-semibold">Dashboard</h1>
  <p class="mt-2 text-gray-600">Akan tersedia setelah fase Auth.</p>
</section>
```

- [ ] **Step 5: Verifikasi build UI**

Run:
```bash
bun run build 2>&1 | tail -15
```
Expected: build sukses; output SvelteKit (adapter-node) terbentuk di `build/`. (Jika `build` script belum ada, jalankan `bunx vite build`.)

- [ ] **Step 6: Commit**

```bash
git add 'src/routes/(public)' 'src/routes/(admin)'
git commit -m "feat(ui): add public landing and admin placeholder shells"
```

---

### Task 12: Playwright Config + E2E Smoke Test

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Tulis `playwright.config.ts`**

Tulis `playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Install browser Chromium**

Run:
```bash
bunx playwright install chromium
```
Expected: browser Chromium terpasang.

- [ ] **Step 3: Tulis e2e smoke test**

Tulis `tests/e2e/smoke.spec.ts`:
```ts
import { expect, test } from '@playwright/test';

test('homepage shows the community heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Fotang Daxin' })).toBeVisible();
});

test('health endpoint returns ok via dev server', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
});
```

- [ ] **Step 4: Jalankan e2e**

Run:
```bash
bunx playwright test
```
Expected: 2 tests passed. (Playwright akan memulai `bun run dev` otomatis via `webServer`. Script `test:e2e` baru ditambahkan di Task 13.)

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/smoke.spec.ts
git commit -m "test(e2e): add playwright config and smoke tests"
```

---

### Task 13: Scripts + bunfig.toml + drizzle.config.ts + Folder .gitkeep

**Files:**
- Modify: `package.json` (scripts)
- Create: `bunfig.toml`
- Create: `drizzle.config.ts`
- Create: `drizzle/.gitkeep`

- [ ] **Step 1: Tulis `scripts` di `package.json`**

Edit `package.json`, set blok `"scripts"` menjadi:
```json
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "preview": "vite preview",
  "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
  "lint": "biome check src tests",
  "format": "biome format --write src tests",
  "test": "bun test tests/unit",
  "test:e2e": "bunx playwright test",
  "db:gen": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "db:mig": "drizzle-kit migrate"
}
```

- [ ] **Step 2: Tulis `bunfig.toml`**

Tulis `bunfig.toml`:
```toml
[test]
preload = []
```

- [ ] **Step 3: Tulis `drizzle.config.ts` (placeholder aktif fase 2)**

Tulis `drizzle.config.ts`:
```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
```
> Catatan: Bun memuat `.env` secara otomatis, sehingga `process.env.DATABASE_URL` tersedia saat `bunx drizzle-kit ...` dijalankan — tidak perlu paket `dotenv`.

- [ ] **Step 4: Folder output migrasi**

Run:
```bash
mkdir -p drizzle && touch drizzle/.gitkeep
```

- [ ] **Step 5: Verifikasi check & lint jalan**

Run:
```bash
bun run check && bun run lint
```
Expected: `check` 0 error; `lint` bersih (atau hanya warning kosmetik). Jika lint melaporkan gaya, jalankan `bun run format` lalu ulangi.

- [ ] **Step 6: Commit**

```bash
git add package.json bunfig.toml drizzle.config.ts drizzle/.gitkeep
git commit -m "chore: add scripts, bunfig, and drizzle placeholder config"
```

---

### Task 14: AGENTS.md + README.md

**Files:**
- Create: `AGENTS.md`
- Modify: `README.md`

- [ ] **Step 1: Tulis `AGENTS.md`**

Tulis `AGENTS.md`:
```markdown
# AGENTS.md

Panduan untuk AI agent (opencode) yang bekerja di repo ini.

## Stack
Bun, SvelteKit, Tailwind v4, Hono (mount di `src/hooks.server.ts`), Drizzle ORM (fase 2), better-auth (fase 3).

## Perintah wajib
- Dev: `bun run dev`
- Build: `bun run build`
- Typecheck: `bun run check`
- Lint: `bun run lint`
- Format: `bun run format`
- Unit test: `bun run test`
- E2E: `bun run test:e2e` (perlu browser: `bunx playwright install chromium`)

## Aturan
- TypeScript strict; tidak boleh `any` tanpa justifikasi.
- Kode Hono (`src/api/**`) tidak boleh bocor ke client bundle.
- Validasi input pakai Zod di `src/lib/shared/validators`.
- Satu-satunya titik mount Hono adalah `src/hooks.server.ts`.
- Pull request per fase/modul, bukan satu PR raksasa.

## Setelah setiap perubahan
Jalankan `bun run check && bun run lint && bun run test` sebelum mengklaim selesai.
```

- [ ] **Step 2: Tulis `README.md`**

Tulis `README.md`:
```markdown
# Website Fotang Daxin

Aplikasi manajemen komunitas Fotang Daxin: data umat, kelas, pendaftaran peserta,
blog/rangkuman, dan media upload. Publik dapat melihat info kelas & blog;
admin/pengurus mengelola data melalui dashboard yang dilindungi autentikasi.

## Prasyarat
- [Bun](https://bun.sh) 1.3+
- Node 20+ (untuk beberapa tooling)

## Setup
```bash
cp .env.example .env      # sesuaikan nilai
bun install
bun run dev               # http://localhost:5173
```

## Skrip
| Perintah | Keterangan |
|---|---|
| `bun run dev` | Dev server |
| `bun run build` | Build produksi (adapter-node) |
| `bun run check` | Typecheck (svelte-check) |
| `bun run lint` | Lint via Biome |
| `bun run test` | Unit test (bun test) |
| `bun run test:e2e` | E2E (Playwright) |

## Status
Fase 1 (Scaffold) — selesai. Fase berikutnya: Database, Auth, lalu modul fitur.
Lihat `docs/superpowers/specs/` dan `docs/superpowers/plans/`.
```

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md README.md
git commit -m "docs: add AGENTS.md and README"
```

---

### Task 15: Verification Gate (DoD) + Bundle Leak Check

**Files:** _(tidak ada perubahan kode — verifikasi & rapikan)_

- [ ] **Step 1: Format & lint**

Run:
```bash
bun run format
bun run lint
```
Expected: format diterapkan; lint bersih.

- [ ] **Step 2: Install bersih**

Run:
```bash
rm -rf node_modules bun.lock
bun install
```
Expected: `bun install` selesai tanpa error.

- [ ] **Step 3: Typecheck**

Run:
```bash
bun run check
```
Expected: 0 error, 0 warning.

- [ ] **Step 4: Unit test**

Run:
```bash
bun run test
```
Expected: `1 pass` (api-health).

- [ ] **Step 5: Build**

Run:
```bash
bun run build
```
Expected: build sukses, output di `build/`.

- [ ] **Step 6: Bundle leak check — tidak ada kode Hono di client bundle**

Run:
```bash
rg -l "hono" .sveltekit/output/client/ build/client/ 2>/dev/null && echo "FAIL: hono ditemukan di client bundle" || echo "OK: tidak ada hono di client bundle"
```
Expected: cetak `OK: tidak ada hono di client bundle`.

- [ ] **Step 7: E2E**

Run:
```bash
bun run test:e2e
```
Expected: 2 tests passed.

- [ ] **Step 8: Dev server health manual**

Run (di terminal terpisah / background):
```bash
bun run dev &
sleep 4
curl -s http://localhost:5173/api/health
kill %1
```
Expected: JSON `{"ok":true,"service":"website-fotang-daxin","ts":"..."}`.

- [ ] **Step 9: Rapikan artefak & commit final**

Run:
```bash
rm -rf test-results playwright-report
git status
```
Jika ada perubahan (mis. hasil format), commit:
```bash
git add -A
git commit -m "chore: scaffold phase 1 final cleanup" || echo "nothing to commit"
```

- [ ] **Step 10: Ringkas status DoD**

Konfirmasi semua item DoD terpenuhi:
- [x] `bun install` bersih
- [x] `bun run check` lulus
- [x] `bun run lint` lulus
- [x] `bun run build` sukses + no Hono in client bundle
- [x] `bun run test` lulus
- [x] `bun run test:e2e` lulus
- [x] dev server `/api/health` → 200

---

## Catatan untuk Implementer

- **Urutan task wajib** mengikuti nomor; beberapa task bergantung output task sebelumnya (mis. Task 9 → Task 10 → Task 12).
- **Jika sebuah nama paket gagal** saat `bun add` (versi/adapter berubah), catat di komentar commit dan lanjut — jangan memblokir scaffold (spec §16).
- **Stub** (`db.ts`, `r2.ts`, `auth.ts`) tidak boleh punya side-effect saat import; hanya melempar saat dipanggil.
- **Jangan** membuat file schema/migrasi Drizzle di fase ini (tugas Fase 2).
- **Commit granular** per task seperti dicontohkan.
