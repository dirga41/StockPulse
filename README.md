# StockPulse

Sistem web pemantauan stok multi-cabang dengan alert stok kritis.
Dibangun dengan **Next.js 16 (App Router)**, **Node.js**, **PostgreSQL**, **Prisma ORM**, dan **Tailwind CSS**.

Tahap 1 (sudah ada): manajemen stok antar cabang + alert stok kritis.
Tahap berikutnya: penjadwalan pemeliharaan aset, laporan & grafik, notifikasi terjadwal (node-cron), peran pengguna.

## Fitur

- **Login** dengan username dan password (tombol mata untuk melihat/menyembunyikan password). Semua halaman dan API wajib login.
- **Dashboard** dengan ringkasan per cabang, jumlah stok kritis/habis, dan daftar alert. Halaman memuat ulang data otomatis tiap 15 detik.
- **Alert stok kritis**: stok dianggap *Kritis* bila `quantity <= minThresholdQty`, dan *Habis* bila 0. Ambang batas bisa diatur per barang per cabang.
- **Saran transfer**: untuk tiap alert, sistem mencari cabang lain yang stoknya berlebih (tanpa membuat cabang itu ikut kritis) dan menyiapkan form transfer satu klik.
- **Mutasi stok**: barang masuk, keluar, dan stock opname (set jumlah).
- **Transfer antar cabang** dalam satu transaksi database.
- **Audit trail** (`stock_logs`) untuk setiap perubahan stok, termasuk jumlah sebelum dan sesudah.
- **Master data** cabang dan barang. Barang/cabang baru otomatis tercatat di semua cabang dengan stok 0.
- **REST API** untuk integrasi (lihat di bawah).

Konsistensi stok dijaga dengan transaksi PostgreSQL dan penguncian baris (`SELECT ... FOR UPDATE`), sehingga transaksi paralel tidak bisa membuat stok minus atau saling menimpa.

## Menjalankan secara lokal

Prasyarat: Node.js 20+ dan PostgreSQL 14+.

```bash
# 1. Install dependency
npm install

# 2. Buat database dan atur koneksi
createdb stockpulse
cp .env.example .env        # sesuaikan DATABASE_URL dan isi AUTH_SECRET dengan teks acak panjang

# 3. Buat tabel dan isi data contoh (3 cabang, 8 barang, akun admin)
npx prisma migrate deploy
npm run db:seed

# 4. Jalankan
npm run dev                 # http://localhost:3000
```

Login awal: username `admin`, password `admin123`. Ganti password atau tambah pengguna:

```bash
npm run user:create -- admin passwordBaru "Administrator"
npm run user:create -- budi rahasia123 "Budi Santoso"
```

Perintah lain: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`, `npm run db:migrate` (membuat migrasi baru setelah mengubah `prisma/schema.prisma`).

## Struktur

```
prisma/schema.prisma      Skema database (stores, items, store_inventory, stock_logs, stock_transfers)
prisma/seed.ts            Data contoh
src/lib/stock.ts          Logika inti: mutasi, transfer, status & alert stok kritis
src/lib/catalog.ts        Tambah cabang / barang
src/lib/validation.ts     Validasi input (zod)
src/app/api/*             REST API (Route Handlers, runtime Node.js)
src/app/actions.ts        Server Actions untuk form di UI
src/app/(page).tsx        Halaman: /, /stok, /transfer, /riwayat, /master
```

## REST API

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/stores` | Daftar cabang |
| POST | `/api/stores` | `{ code, name, address? }` |
| GET | `/api/items` | Daftar barang |
| POST | `/api/items` | `{ sku, name, unit?, categoryName?, defaultMinThreshold? }` |
| GET | `/api/inventory?storeId=&status=` | Stok per cabang; `status` = `HABIS` / `KRITIS` / `AMAN` |
| PATCH | `/api/inventory/:id` | `{ minThresholdQty }` |
| GET | `/api/stock-movements?storeId=&itemId=&limit=` | Riwayat mutasi |
| POST | `/api/stock-movements` | `{ storeId, itemId, type: "IN" \| "OUT" \| "ADJUSTMENT", quantity, note? }` |
| GET | `/api/transfers` | Riwayat transfer |
| POST | `/api/transfers` | `{ fromStoreId, toStoreId, itemId, quantity, note? }` |
| GET | `/api/alerts?storeId=` | Stok kritis + saran cabang sumber transfer |

API memakai cookie sesi yang sama dengan halaman web; tanpa login API mengembalikan 401.

Error dikembalikan sebagai `{ "error": "pesan" }` dengan status 400 (input tidak valid), 409 (duplikat), atau 422 (mis. stok tidak cukup).

Contoh:

```bash
curl -X POST localhost:3000/api/transfers -H 'content-type: application/json' \
  -d '{"fromStoreId":1,"toStoreId":2,"itemId":3,"quantity":10,"note":"restock"}'
```
