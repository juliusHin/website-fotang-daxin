# Issue: User Management Database Schema (Fase 2 — Database)

**Tanggal:** 2026-07-26  
**Status:** Draft Planning  
**Terinspirasi dari:** User request manajemen data umat Fotang Daxin

## 1. Tujuan

Membuat skema database untuk manajemen data umat (users) menggunakan Drizzle ORM dan PostgreSQL. Skema ini menjadi fondasi untuk modul Umat di fase selanjutnya, mencakup data personal, kontak, status vegetarian, dan QR code untuk check-in multi-fungsi.

## 2. Non-Tujuan (di luar scope)

- Autentikasi/authorization (better-auth) → **Fase 3 (Auth)**
- API endpoints untuk CRUD users → **Fase modul Umat**
- UI admin untuk manajemen users → **Fase modul Umat**
- Tracking perubahan vegetarian status (hanya current state)
- QR code scanning/verifikasi logic → **Fase modul Umat/Event**

## 3. Database Schema

### Tabel `users`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PRIMARY KEY | UUID v7 for sortability |
| full_name | VARCHAR(255) NOT NULL | Nama lengkap |
| mandarin_name | VARCHAR(255) | Nama Mandarin (opsional) |
| gender | VARCHAR(10) | L/P/Other |
| birth_date | DATE | Tanggal lahir |
| address | TEXT | Alamat lengkap |
| phone_whatsapp | VARCHAR(20) | WhatsApp utama (legacy/shortcut) |
| dhamma_1_day_completed | BOOLEAN DEFAULT FALSE | Lulus Dhamma 1 hari |
| dhamma_3_day_completed | BOOLEAN DEFAULT FALSE | Lulus Dhamma 3 hari |
| vegetarian_status | VARCHAR(20) | FK ke vegetarian_statuses.name |
| qr_code | TEXT NOT NULL | Token unik untuk QR code |
| created_at | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Waktu record dibuat |

### Tabel `vegetarian_statuses`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT PRIMARY KEY | Sequential ID |
| name | VARCHAR(50) UNIQUE NOT NULL | Status: 'belum', 'belajar', 'ikrar' |

### Tabel `user_contacts`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID PRIMARY KEY | UUID v7 |
| user_id | UUID NOT NULL FK users.id | Relasi ke users |
| type | VARCHAR(20) NOT NULL | 'whatsapp', 'phone', 'email', dll |
| value | VARCHAR(50) NOT NULL | Nilai kontak |

**Constraint:**
- `users.vegetarian_status` harus validasi terhadap `vegetarian_statuses.name`
- `user_contacts.user_id` CASCADE delete bila user dihapus

## 4. QR Code Strategy

**Multi-fungsi:**
- Check-in dashboard admin (kelas/kegiatan)
- Potensi public profile page
- Potensi self-service features di masa depan

**Implementasi:**
- Gunakan UUID v7 sebagai base token
- Hash dengan SHA-256 untuk keamanan + consistency
- Prefix 'FD-' (Fotang Daxin) untuk readability
- Format: `FD-<hash_prefix>`

Contoh: `FD-a3f8b2c1...` (hash 8-12 karakter pertama)

**Catatan:** Full hash disimpan di kolom `qr_code` untuk verifikasi; QR code yang ditampilkan di UI hanya prefix/short version.

## 5. Drizzle Schema Structure

**Folder:** `src/lib/server/schema/`

**Files:**
- `users.ts` → schema `users`, `vegetarian_statuses`, `user_contacts`
- `index.ts` → export semua schema

**Pattern:**
```typescript
// users.ts
export const users = pgTable('users', { ... });
export const vegetarianStatuses = pgTable('vegetarian_statuses', { ... });
export const userContacts = pgTable('user_contacts', { ... });

// index.ts
export * from './users';
```

## 6. Migrasi Strategy

**Urutan migrasi:**
1. `vegetarian_statuses` (reference table dulu)
2. `users` (main table)
3. `user_contacts` (dependent table)

**Command:**
```bash
bun run db:gen  # generate migration files
bun run db:push  # push ke development DB
bun run db:mig  # run migration di production
```

**Output folder:** `drizzle/`

## 7. Seed Data

**Initial data untuk `vegetarian_statuses`:**
```sql
INSERT INTO vegetarian_statuses (id, name) VALUES 
(1, 'belum'),
(2, 'belajar'),
(3, 'ikrar');
```

**Seed script:** `scripts/seed-vegetarian-statuses.ts`

## 8. Validation & Constraints

**Zod validators** (di `src/lib/shared/validators/users.ts`):
- `full_name`: required, max 255 karakter
- `phone_whatsapp`: optional, max 20 karakter
- `vegetarian_status`: harus salah satu dari ['belum', 'belajar', 'ikrar']
- `qr_code`: required, format 'FD-<alphanumeric>'

**Database constraints:**
- `full_name`: NOT NULL
- `vegetarian_status`: check constraint harus valid terhadap vegetarian_statuses
- `user_contacts.user_id`: FK dengan CASCADE DELETE

## 9. Integration Points

**Fase 2 (Scope ini):**
- `src/lib/server/db.ts` → replace stub dengan actual Drizzle connection
- Environment variables di `.env.example` → sudah ada `DATABASE_URL`

**Fase 3 (Auth):**
- Hubungkan dengan better-auth untuk session management
- Otorisasi admin untuk mengakses data users

**Fase modul Umat:**
- CRUD API endpoints untuk users
- Admin UI untuk manajemen data umat
- QR code generation & scanning

## 10. Testing Strategy

**Unit tests** (`tests/unit/users.test.ts`):
- Test schema creation
- Test validasi Zod validators
- Test QR code generation logic

**Integration tests** (opsional fase ini, wajib fase Umat):
- Test CRUD operations via Drizzle
- Test FK constraints

## 11. Definition of Done

1. Schema Drizzle tersedia di `src/lib/server/schema/users.ts`
2. Migrasi files tersedia di `drizzle/` (urutan benar)
3. Seed script `vegetarian_statuses` tersedia & ter-test
4. `bun run db:push` berhasil ke development DB
5. Validasi Zod untuk users tersedia & tested
6. QR code generation utility tersedia & tested
7. Typecheck lulus (`bun run check`)
8. Lint lulus (`bun run lint`)

## 12. Catatan & Keputusan

**Q: Kenapa ada `phone_whatsapp` di `users` TAPI juga tabel `user_contacts`?**  
A: `phone_whatsapp` adalah legacy/shortcut untuk backwards compatibility. `user_contacts` untuk multiple contacts (whatsapp kedua, email, telepon rumah, dll).

**Q: Kenapa vegetarian_status di `users` menggunakan VARCHAR, bukan FK?**  
A: Kita gunakan VARCHAR dengan validation constraint terhadap `vegetarian_statuses.name` untuk lebih flexibility. FK di `user_contacts` karena relasi parent-child yang lebih explicit.

**Q: Kenapa QR code pakai hash, bukan langsung UUID?**  
A: Hash memberikan consistency untuk check-in. Jika QR code butuh digenerate ulang, hash tetap sama untuk user yang sama. UUID hanya berfungsi sebagai internal identifier.

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| QR code collision | Gunakan SHA-256 + prefix FD-; collision probability near-zero |
| `vegetarian_status` invalid data | Constraint check di DB + validation Zod di layer aplikasi |
| Migration order salah | Dokumentasikan urutan migrasi explicit di plan ini |

---

**Next steps:**
1. Implement Drizzle schema files
2. Generate & run migrations
3. Buat seed script untuk vegetarian_statuses
4. Implement Zod validators
5. Implement QR code utility
6. Testing & verification