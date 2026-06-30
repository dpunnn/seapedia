# SEAPEDIA

SEAPEDIA adalah marketplace e-commerce multi-peran yang menghubungkan Pembeli, Penjual, dan Pengemudi dalam satu ekosistem.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express.js + TypeScript + Prisma 7 + PostgreSQL |
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS + Shadcn/ui |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod (backend) + React Hook Form (frontend) |
| ORM | Prisma 7 dengan adapter `@prisma/adapter-pg` |

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14 (atau Docker)
- npm >= 9

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/dpunnn/seapedia.git
cd seapedia
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: isi DATABASE_URL, JWT_SECRET, CLIENT_URL
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev        # berjalan di http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local jika backend URL berbeda
npm install
npm run dev        # berjalan di http://localhost:3000
```

### 4. Docker PostgreSQL (opsional)

```bash
docker run -d \
  --name seapedia-db \
  -e POSTGRES_USER=seapedia \
  -e POSTGRES_PASSWORD=seapedia123 \
  -e POSTGRES_DB=seapedia \
  -p 5433:5432 \
  postgres:16
```

DATABASE_URL untuk Docker: `postgresql://seapedia:seapedia123@localhost:5433/seapedia`

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@seapedia.com | admin123 |
| Seller | seller@seapedia.com | seller123 |
| Buyer | buyer@seapedia.com | buyer123 |
| Driver | driver@seapedia.com | driver123 |
| Multi-role (Seller+Buyer) | multi@seapedia.com | multi123 |

**Voucher aktif**: `SEAPEDIA10` (10% diskon, min Rp100.000)  
**Promo aktif**: `SUMMER50K` (fixed Rp50.000, min Rp200.000)

## API Documentation

Swagger UI tersedia di: `http://localhost:5000/api/docs`

## Business Rules

### Multi-role System
- Satu akun bisa memiliki beberapa role non-admin (Buyer, Seller, Driver) secara bersamaan
- Setelah login, user memilih **activeRole** via `POST /api/auth/select-role`
- Otorisasi berbasis activeRole di JWT — bukan hanya daftar role yang dimiliki
- Admin adalah role terpisah yang tidak bisa dikombinasikan dengan role lain

### Single-Store Checkout
Karena SEAPEDIA adalah marketplace multi-penjual, **satu cart hanya boleh berisi produk dari satu toko**.

- Jika buyer mencoba menambah produk dari toko berbeda, sistem mengembalikan error 409
- Buyer harus mengosongkan cart terlebih dahulu sebelum menambah dari toko lain
- Aturan ini ditampilkan jelas di halaman cart dan didokumentasikan di README ini

### Kalkulasi Checkout

```
subtotal       = Σ(harga_produk × quantity)
discountAmount = hasil validasi kode voucher/promo (0 jika tidak ada)
ppnBase        = subtotal - discountAmount
ppnAmount      = ppnBase × 0.12          ← PPN 12%
deliveryFee    = 25.000 (INSTANT) | 15.000 (NEXT_DAY) | 10.000 (REGULAR)
total          = ppnBase + ppnAmount + deliveryFee
             = ppnBase × 1.12 + deliveryFee
```

PPN 12% dihitung dari harga setelah diskon (bukan harga awal).

### Voucher vs Promo

| Aspek | Voucher | Promo |
|-------|---------|-------|
| Usage limit | Ada (usageLimit) | Unlimited |
| Expiry | Ya | Ya |
| Tipe diskon | PERCENTAGE atau FIXED | PERCENTAGE atau FIXED |
| Pengelolaan | Admin UI | Admin UI |

Voucher dan Promo **tidak bisa dikombinasikan** — hanya 1 kode per checkout.

### Delivery Fee & Driver Earnings

| Metode | Ongkos Kirim | Driver Dapat |
|--------|-------------|--------------|
| INSTANT | Rp 25.000 | Rp 20.000 (80%) |
| NEXT_DAY | Rp 15.000 | Rp 12.000 (80%) |
| REGULAR | Rp 10.000 | Rp 8.000 (80%) |

Driver mendapat **80% dari delivery fee** setelah konfirmasi pengantaran selesai.

### Order Lifecycle

```
[Buyer Checkout]
    → SEDANG_DIKEMAS
    → [Seller: Proses Pesanan] → MENUNGGU_PENGIRIM
    → [Driver: Ambil Job] → SEDANG_DIKIRIM
    → [Driver: Konfirmasi Selesai] → PESANAN_SELESAI

[Overdue — SLA terlampaui saat SEDANG_DIKIRIM]
    → DIKEMBALIKAN (auto-refund ke buyer + stok dikembalikan)
```

### Overdue SLA

| Metode | SLA sejak SEDANG_DIKIRIM |
|--------|--------------------------|
| INSTANT | 1 hari |
| NEXT_DAY | 2 hari |
| REGULAR | 5 hari |

Sistem menggunakan **virtual date** (bukan waktu real) untuk simulasi waktu.  
Admin bisa maju-kan virtual date via Dashboard Admin → Simulasi Waktu.  
Saat virtual date melewati deadline, pesanan otomatis di-DIKEMBALIKAN dan buyer di-refund.

### Race Condition Prevention

Driver yang mengambil job menggunakan `updateMany` dengan kondisi `WHERE status=AVAILABLE AND driverId=null`. Jika tidak ada row yang ter-update (karena driver lain lebih dulu), sistem mengembalikan error 409.

## Security

| Aspek | Implementasi |
|-------|-------------|
| SQL Injection | Prisma ORM menggunakan parameterized queries secara otomatis |
| XSS | Input user-generated (review) di-sanitize dengan `validator.escape()` di backend. Frontend React me-render sebagai teks biasa — tidak ada `dangerouslySetInnerHTML` |
| Input Validation | Zod schema validation di semua endpoint backend |
| Rate Limiting | 200 req/15mnt (global), 20 req/15mnt (auth endpoints) |
| Security Headers | Helmet.js: X-Content-Type-Options, X-Frame-Options, HSTS, dll |
| RBAC | activeRole diverifikasi server-side per endpoint. Ownership check per resource (seller hanya bisa edit produk sendiri) |
| Session | JWT expire 7 hari. Logout = hapus token di client (localStorage). Token tidak disimpan di server |

## Project Structure

```
seapedia/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Demo data
│   └── src/
│       ├── controllers/       # Business logic
│       ├── middleware/        # Auth, role, error handlers
│       ├── routes/            # Route definitions
│       ├── services/          # overdue.service.ts
│       ├── utils/             # prisma, jwt, response helpers
│       └── app.ts             # Express setup + Swagger + Rate limiting
└── frontend/
    └── app/
        ├── page.tsx           # Landing page
        ├── products/          # Product catalog
        ├── reviews/           # App reviews
        ├── login, register    # Auth pages
        └── dashboard/
            ├── admin/         # Admin monitoring (users, orders, stores, products, deliveries, vouchers, promos, time)
            ├── buyer/         # Wallet, cart, checkout, orders, addresses, report
            ├── driver/        # Job list, active job, history
            └── seller/        # Store, products, orders, income
```
