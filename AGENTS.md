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
