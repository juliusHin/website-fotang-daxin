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
