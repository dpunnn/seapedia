import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

type UserSeed = { username: string; email: string; password: string; roles: Role[] };

const users: UserSeed[] = [
  { username: 'admin_sea', email: 'admin@seapedia.com', password: 'Admin@123', roles: ['ADMIN'] },
  { username: 'budi_buyer', email: 'budi@seapedia.com', password: 'Buyer@123', roles: ['BUYER'] },
  { username: 'siti_seller', email: 'siti@seapedia.com', password: 'Seller@123', roles: ['SELLER'] },
  { username: 'doni_driver', email: 'doni@seapedia.com', password: 'Driver@123', roles: ['DRIVER'] },
  { username: 'multi_user', email: 'multi@seapedia.com', password: 'Multi@123', roles: ['BUYER', 'SELLER', 'DRIVER'] },
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

  // Create store for siti_seller
  const store = await prisma.store.create({
    data: {
      userId: createdUsers['siti_seller'].id,
      name: 'Toko Siti Sejahtera',
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

  // Products for siti_seller's store
  await prisma.product.createMany({
    data: [
      { storeId: store.id, name: 'Beras Premium 5kg', description: 'Beras pulen pilihan', price: 75000, stock: 100, imageUrl: '' },
      { storeId: store.id, name: 'Minyak Goreng 2L', description: 'Minyak kelapa sawit murni', price: 35000, stock: 50, imageUrl: '' },
      { storeId: store.id, name: 'Gula Pasir 1kg', description: 'Gula kristal putih', price: 18000, stock: 200, imageUrl: '' },
      { storeId: store.id, name: 'Telur Ayam 1 Peti', description: '30 butir telur ayam negeri segar', price: 55000, stock: 80, imageUrl: '' },
      { storeId: store.id, name: 'Sabun Mandi Batang', description: 'Sabun antiseptik', price: 8000, stock: 300, imageUrl: '' },
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
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);

  await prisma.voucher.create({
    data: {
      code: 'SEAPEDIA10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minPurchase: 50000,
      maxDiscount: 25000,
      expiryDate: futureDate,
      usageLimit: 100,
    },
  });

  await prisma.voucher.create({
    data: {
      code: 'DISKON50K',
      discountType: 'FIXED',
      discountValue: 50000,
      minPurchase: 200000,
      expiryDate: futureDate,
      usageLimit: 50,
    },
  });

  await prisma.promo.create({
    data: {
      code: 'PROMO15',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minPurchase: 100000,
      maxDiscount: 30000,
      expiryDate: futureDate,
    },
  });

  // System settings: virtual date
  await prisma.systemSettings.create({
    data: { key: 'virtual_date', value: new Date().toISOString() },
  });

  // App reviews
  await prisma.appReview.createMany({
    data: [
      { reviewerName: 'Budi', comment: 'Aplikasi sangat mudah digunakan!', rating: 5 },
      { reviewerName: 'Siti', comment: 'Produk lengkap, pengiriman cepat.', rating: 4 },
      { reviewerName: 'Doni', comment: 'Sebagai driver, aplikasinya responsif.', rating: 5 },
    ],
  });

  console.log('Seed complete!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  admin@seapedia.com  / Admin@123  [ADMIN]');
  console.log('  budi@seapedia.com   / Buyer@123  [BUYER]');
  console.log('  siti@seapedia.com   / Seller@123 [SELLER]');
  console.log('  doni@seapedia.com   / Driver@123 [DRIVER]');
  console.log('  multi@seapedia.com  / Multi@123  [BUYER+SELLER+DRIVER]');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
