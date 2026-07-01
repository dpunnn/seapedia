import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

type UserSeed = { username: string; email: string; password: string; roles: Role[] };

const users: UserSeed[] = [
  { username: 'admin_sea', email: 'admin@seapedia.com', password: 'admin123', roles: ['ADMIN'] },
  { username: 'buyer_sea', email: 'buyer@seapedia.com', password: 'buyer123', roles: ['BUYER'] },
  { username: 'seller_sea', email: 'seller@seapedia.com', password: 'seller123', roles: ['SELLER'] },
  { username: 'driver_sea', email: 'driver@seapedia.com', password: 'driver123', roles: ['DRIVER'] },
  { username: 'multi_user', email: 'multi@seapedia.com', password: 'multi123', roles: ['BUYER', 'SELLER'] },
];

async function main() {
  console.log('Seeding database...');

  // Clean up
  await prisma.walletTransaction.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.deliveryJob.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.address.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.promo.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSettings.deleteMany();

  // Create users
  const createdUsers: Record<string, any> = {};

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username: u.username,
        email: u.email,
        passwordHash,
        roles: { create: u.roles.map((role) => ({ role })) },
      },
    });

    createdUsers[u.username] = user;

    // Create wallet for BUYER/DRIVER
    const needsWallet = u.roles.some((r) => r === 'BUYER' || r === 'DRIVER');
    if (needsWallet) {
      await prisma.wallet.create({
        data: { userId: user.id, balance: u.roles.includes('BUYER') ? 500000 : 0 },
      });
    }

    // Create cart for BUYER
    if (u.roles.includes('BUYER')) {
      await prisma.cart.create({ data: { buyerId: user.id } });

      await prisma.address.create({
        data: {
          userId: user.id,
          label: 'Rumah',
          fullAddress: 'Jl. Demo No. 1',
          city: 'Jakarta Selatan',
          province: 'DKI Jakarta',
          postalCode: '12345',
          isDefault: true,
        },
      });
    }
  }

  const multiUser = createdUsers['multi_user'];

  // Create store for seller_sea
  const store = await prisma.store.create({
    data: {
      userId: createdUsers['seller_sea'].id,
      name: 'Toko Budi',
      description: 'Toko kebutuhan sehari-hari dengan produk berkualitas',
    },
  });

  // Also create store for multi_user
  const store2 = await prisma.store.create({
    data: {
      userId: multiUser.id,
      name: 'Multi Store COMPFEST',
      description: 'Demo multi-role store',
    },
  });

  // Products for seller_sea's store (5 produk)
  await prisma.product.createMany({
    data: [
      { storeId: store.id, name: 'Beras Premium 5kg', description: 'Beras pulen pilihan petani lokal', price: 75000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
      { storeId: store.id, name: 'Minyak Goreng 2L', description: 'Minyak kelapa sawit murni premium', price: 35000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
      { storeId: store.id, name: 'Gula Pasir 1kg', description: 'Gula kristal putih grade A', price: 18000, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400' },
      { storeId: store.id, name: 'Telur Ayam 1 Peti', description: '30 butir telur ayam negeri segar', price: 55000, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=400' },
      { storeId: store.id, name: 'Sabun Mandi Antiseptik', description: 'Sabun antiseptik proteksi 99.9%', price: 8000, stock: 300, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400' },
    ],
  });

  // Products for multi store
  await prisma.product.createMany({
    data: [
      { storeId: store2.id, name: 'Laptop Gaming Budget', description: 'Cocok untuk coding', price: 7500000, stock: 10, imageUrl: '' },
      { storeId: store2.id, name: 'Mouse Wireless', description: 'Anti-lag, baterai tahan lama', price: 150000, stock: 50, imageUrl: '' },
    ],
  });

  // Voucher & Promo
  const expiry2026 = new Date('2026-12-31T23:59:59Z');
  const expiredDate = new Date('2026-01-01T00:00:00Z');

  // Voucher aktif: DISKON10 (10%, min 50rb, max 25rb, 100 usage)
  await prisma.voucher.create({
    data: {
      code: 'DISKON10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: 50000,
      maxDiscount: 25000,
      expiryDate: expiry2026,
      usageLimit: 100,
    },
  });

  // Voucher expired: LAMA20
  await prisma.voucher.create({
    data: {
      code: 'LAMA20',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minPurchase: 50000,
      expiryDate: expiredDate,
      usageLimit: 50,
    },
  });

  // Promo aktif: PROMO50K (fixed 50rb, min 200rb)
  await prisma.promo.create({
    data: {
      code: 'PROMO50K',
      discountType: 'FIXED',
      discountValue: 50000,
      minPurchase: 200000,
      expiryDate: expiry2026,
    },
  });

  // System settings: virtual date
  await prisma.systemSettings.create({
    data: { key: 'virtual_date', value: new Date().toISOString() },
  });

  // App reviews (5 buah sesuai spec)
  await prisma.appReview.createMany({
    data: [
      { reviewerName: 'Budi Santoso', comment: 'Aplikasi sangat mudah digunakan! Belanja jadi lebih praktis.', rating: 5 },
      { reviewerName: 'Siti Rahayu', comment: 'Produk lengkap dan harga kompetitif. Pengiriman cepat!', rating: 4 },
      { reviewerName: 'Doni Kurniawan', comment: 'Sebagai driver, dashboard-nya responsif dan informatif.', rating: 5 },
      { reviewerName: 'Rina Wati', comment: 'Fitur dompet digital sangat membantu transaksi sehari-hari.', rating: 4 },
      { reviewerName: 'Ahmad Fauzi', comment: 'Multi-role system keren! Bisa jadi buyer sekaligus seller.', rating: 5 },
    ],
  });

  console.log('Seed complete!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  admin@seapedia.com   / admin123   [ADMIN]');
  console.log('  buyer@seapedia.com   / buyer123   [BUYER]  wallet: Rp500.000');
  console.log('  seller@seapedia.com  / seller123  [SELLER] toko: Toko Budi');
  console.log('  driver@seapedia.com  / driver123  [DRIVER]');
  console.log('  multi@seapedia.com   / multi123   [BUYER+SELLER]');
  console.log('');
  console.log('Vouchers: DISKON10 (aktif), LAMA20 (expired)');
  console.log('Promos:   PROMO50K (aktif)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
