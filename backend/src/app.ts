import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import reviewRoutes from './routes/review.routes';
import sellerRoutes from './routes/seller.routes';
import buyerRoutes from './routes/buyer.routes';
import driverRoutes from './routes/driver.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting — 100 req/15 min per IP, stricter for auth
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak request, coba lagi nanti' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan login, coba lagi dalam 15 menit' },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Swagger UI
const swaggerDoc = {
  openapi: '3.0.0',
  info: {
    title: 'SEAPEDIA API',
    version: '1.0.0',
    description: `SEAPEDIA Marketplace API - COMPFEST 18 Software Engineering Academy

## Business Rules
- **Single-store checkout**: Satu cart hanya bisa berisi produk dari 1 toko
- **PPN**: 12% dihitung dari (subtotal - discount). Total = ppnBase * 1.12 + delivery_fee
- **Delivery fee**: INSTANT Rp25.000 / NEXT_DAY Rp15.000 / REGULAR Rp10.000
- **Driver earnings**: 80% dari delivery_fee
- **Overdue SLA**: INSTANT=1hr, NEXT_DAY=2hr, REGULAR=5hr setelah SEDANG_DIKIRIM

## Authentication
Gunakan JWT Bearer token. Login → dapatkan token → set header \`Authorization: Bearer <token>\`
Multi-role: pilih activeRole via \`POST /auth/select-role\` setelah login.

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@seapedia.com | admin123 |
| Seller | seller@seapedia.com | seller123 |
| Buyer | buyer@seapedia.com | buyer123 |
| Driver | driver@seapedia.com | driver123 |
| Multi-role | multi@seapedia.com | multi123 |`,
  },
  servers: [{ url: '/api', description: 'SEAPEDIA API Server' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register akun baru',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password', 'roles'],
                properties: {
                  username: { type: 'string', minLength: 3 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  roles: { type: 'array', items: { type: 'string', enum: ['BUYER', 'SELLER', 'DRIVER'] } },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Registrasi berhasil' }, '400': { description: 'Validasi gagal / email sudah digunakan' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login dan dapatkan JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Login berhasil, kembalikan token' }, '401': { description: 'Email/password salah' } },
      },
    },
    '/auth/select-role': {
      post: {
        tags: ['Auth'],
        summary: 'Pilih activeRole untuk sesi ini',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: { role: { type: 'string', enum: ['BUYER', 'SELLER', 'DRIVER', 'ADMIN'] } },
              },
            },
          },
        },
        responses: { '200': { description: 'Token baru dengan activeRole' }, '403': { description: 'User tidak punya role ini' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Dapatkan profil user yang sedang login',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Data user + roles + activeRole' } },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (client hapus token)',
        responses: { '200': { description: 'Logout berhasil' } },
      },
    },
    '/products': {
      get: {
        tags: ['Public'],
        summary: 'List semua produk aktif',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
        ],
        responses: { '200': { description: 'List produk + info toko' } },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Public'],
        summary: 'Detail produk',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Detail produk + info toko' }, '404': { description: 'Produk tidak ditemukan' } },
      },
    },
    '/reviews': {
      get: {
        tags: ['Public'],
        summary: 'Daftar ulasan aplikasi',
        responses: { '200': { description: 'List ulasan terbaru' } },
      },
      post: {
        tags: ['Public'],
        summary: 'Submit ulasan aplikasi (tidak perlu login)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reviewerName', 'rating', 'comment'],
                properties: {
                  reviewerName: { type: 'string', minLength: 2 },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string', minLength: 5 },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Ulasan berhasil ditambahkan' } },
      },
    },
    '/buyer/wallet': {
      get: {
        tags: ['Buyer'],
        summary: 'Lihat saldo wallet',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Saldo + riwayat transaksi' } },
      },
    },
    '/buyer/wallet/topup': {
      post: {
        tags: ['Buyer'],
        summary: 'Top-up saldo wallet',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', minimum: 10000 } } },
            },
          },
        },
        responses: { '200': { description: 'Saldo berhasil ditambahkan' } },
      },
    },
    '/buyer/cart': {
      get: {
        tags: ['Buyer'],
        summary: 'Lihat isi keranjang',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Isi cart + subtotal' } },
      },
      delete: {
        tags: ['Buyer'],
        summary: 'Kosongkan keranjang',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Keranjang dikosongkan' } },
      },
    },
    '/buyer/cart/items': {
      post: {
        tags: ['Buyer'],
        summary: 'Tambah produk ke keranjang (single-store rule)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: { productId: { type: 'string' }, quantity: { type: 'integer', minimum: 1 } },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Produk ditambahkan ke keranjang' },
          '409': { description: 'Produk dari toko berbeda — single-store rule' },
        },
      },
    },
    '/buyer/checkout': {
      post: {
        tags: ['Buyer'],
        summary: 'Checkout dan buat pesanan',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['addressId', 'deliveryMethod'],
                properties: {
                  addressId: { type: 'string' },
                  deliveryMethod: { type: 'string', enum: ['INSTANT', 'NEXT_DAY', 'REGULAR'] },
                  discountCode: { type: 'string', description: 'Kode voucher atau promo' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Pesanan berhasil dibuat' },
          '400': { description: 'Saldo tidak cukup / stok habis' },
        },
      },
    },
    '/seller/store': {
      get: {
        tags: ['Seller'],
        summary: 'Lihat toko milik seller',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Info toko + jumlah produk' } },
      },
      post: {
        tags: ['Seller'],
        summary: 'Buat toko baru (1 seller 1 toko)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string', minLength: 3 }, description: { type: 'string' } },
              },
            },
          },
        },
        responses: { '201': { description: 'Toko berhasil dibuat' }, '400': { description: 'Nama toko sudah digunakan' } },
      },
      put: {
        tags: ['Seller'],
        summary: 'Update info toko',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Toko diperbarui' } },
      },
    },
    '/seller/orders/{id}/process': {
      put: {
        tags: ['Seller'],
        summary: 'Proses pesanan: SEDANG_DIKEMAS → MENUNGGU_PENGIRIM',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Status pesanan diperbarui' }, '403': { description: 'Bukan pesanan milik toko Anda' } },
      },
    },
    '/driver/jobs/available': {
      get: {
        tags: ['Driver'],
        summary: 'Lihat job pengiriman yang tersedia (MENUNGGU_PENGIRIM)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'List job tersedia' } },
      },
    },
    '/driver/jobs/{orderId}/take': {
      post: {
        tags: ['Driver'],
        summary: 'Ambil job pengiriman (race-condition safe)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Job berhasil diambil' },
          '409': { description: 'Job sudah diambil driver lain' },
        },
      },
    },
    '/driver/jobs/{orderId}/complete': {
      post: {
        tags: ['Driver'],
        summary: 'Konfirmasi pesanan selesai diantar',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Pesanan selesai, earnings masuk wallet' } },
      },
    },
    '/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Statistik platform (users, toko, produk, pesanan, dll)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Semua statistik dalam 1 response' } },
      },
    },
    '/admin/time/advance': {
      post: {
        tags: ['Admin'],
        summary: 'Simulasi waktu: maju N hari dan proses overdue',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['days'], properties: { days: { type: 'integer', minimum: 1, maximum: 30 } } },
            },
          },
        },
        responses: { '200': { description: 'Waktu maju, overdue diproses, refund dikirim' } },
      },
    },
    '/admin/vouchers': {
      get: {
        tags: ['Admin'],
        summary: 'List semua voucher',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'List voucher' } },
      },
      post: {
        tags: ['Admin'],
        summary: 'Buat voucher baru',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'discountType', 'discountValue', 'expiryDate', 'usageLimit'],
                properties: {
                  code: { type: 'string' },
                  discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED'] },
                  discountValue: { type: 'number' },
                  minPurchase: { type: 'number' },
                  maxDiscount: { type: 'number' },
                  expiryDate: { type: 'string', format: 'date-time' },
                  usageLimit: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Voucher berhasil dibuat' } },
      },
    },
  },
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
