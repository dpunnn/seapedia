// ═══════════════════════════════════════════════════════════════════════
// SEAPEDIA — Shared prototype data layer (localStorage-backed)
// ═══════════════════════════════════════════════════════════════════════
// This is a FRONTEND PROTOTYPE data layer — there is no real backend here.
// All "business rules" from the SEAPEDIA brief are implemented as plain
// JS functions operating on a single JSON blob in localStorage, so state
// stays consistent while navigating between the separate .dc.html pages.
//
// Documented design decisions (see also Admin > Pengaturan > "Dokumentasi"):
// - Single-store checkout: db.cart can only hold items from one storeId.
//   Adding a product from a different store returns {error:'different_store'}
//   so the UI can prompt the buyer to clear the cart first.
// - Tax rule: PPN 12% is computed on (subtotal - discount), delivery fee is
//   NOT taxed and is not discounted (except the 'freeship' voucher type,
//   which zeroes the delivery fee directly).
// - Discount combination rule: only ONE discount code per checkout, and it
//   may be either a Voucher or a Promo (looked up by code across both lists).
// - Delivery SLA (used for overdue auto-refund/return):
//     Instant   → 3 hours,  fee Rp 25.000
//     Next Day  → 30 hours, fee Rp 15.000
//     Regular   → 72 hours, fee Rp 9.000
// - Driver earning rule: 80% of the order's delivery fee per completed job.
// - Seller income is always computed LIVE as the sum of orders whose
//   CURRENT status is "Pesanan Selesai" for that store. Because an overdue
//   order is moved to "Dikembalikan" (not "Pesanan Selesai"), refunded
//   orders are automatically excluded from income — no separate reversal
//   ledger is needed for this prototype.
// - This demo intentionally keeps ONE wallet ("the current buyer's wallet")
//   rather than a full per-username ledger, to keep the prototype legible.
// ═══════════════════════════════════════════════════════════════════════

const KEY = 'seapedia_db_v2';

function iso(d) { return new Date(d).toISOString(); }
function hoursFromNow(base, h) { return new Date(new Date(base).getTime() + h * 3600 * 1000).toISOString(); }
function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }
function hoursAgo(n) { return new Date(Date.now() - n * 3600000).toISOString(); }

export const DELIVERY_META = {
  instant:  { label: 'Instant (2 jam)',   fee: 25000, slaHours: 3  },
  next_day: { label: 'Next Day (besok)',  fee: 15000, slaHours: 30 },
  regular:  { label: 'Reguler (2-3 hari)',fee: 9000,  slaHours: 72 },
};

export const ORDER_STATUSES = ['Sedang Dikemas', 'Menunggu Pengirim', 'Sedang Dikirim', 'Pesanan Selesai', 'Dikembalikan'];

function seed() {
  const now = new Date();
  const stores = [
    { id: 1, name: 'TechStore Jakarta',  ownerUsername: 'ahmad', category: 'elektronik', logo: '💻', rating: 4.9, verified: true,  followers: 12400, description: 'Spesialis laptop, gadget, dan aksesoris teknologi original bergaransi resmi.' },
    { id: 2, name: 'Batik Nusantara',    ownerUsername: 'rudi',  category: 'fashion',    logo: '👔', rating: 4.8, verified: true,  followers: 8100,  description: 'Batik tulis & cap premium langsung dari pengrajin Pekalongan & Solo.' },
    { id: 3, name: 'Sport Station ID',   ownerUsername: 'bima',  category: 'fashion',    logo: '👟', rating: 4.7, verified: false, followers: 5300,  description: 'Sepatu dan apparel olahraga original dari brand ternama dunia.' },
    { id: 4, name: 'Audio World ID',     ownerUsername: 'yuni',  category: 'elektronik', logo: '🎧', rating: 4.8, verified: true,  followers: 6700,  description: 'Headphone, speaker, dan audio gear premium untuk audiophile.' },
    { id: 5, name: 'Toko Buku Digital',  ownerUsername: 'dewi2', category: 'buku',       logo: '📚', rating: 4.6, verified: true,  followers: 3200,  description: 'Buku fisik & referensi kurikulum, dikirim rapi dan cepat.' },
    { id: 6, name: 'Rumah Dapur Indah',  ownerUsername: 'siti',  category: 'rumah',      logo: '🏠', rating: 4.5, verified: false, followers: 2100,  description: 'Peralatan rumah tangga dan dapur pilihan dengan harga bersahabat.' },
  ];

  const products = [
    { id:1,  storeId:1, name:'Laptop ASUS ROG Zephyrus G14 2024', category:'elektronik', price:14500000, stock:5,  sold:234,  rating:4.8, emoji:'💻', bg:'#EFF6FF', active:true, description:'Laptop gaming ringkas dengan AMD Ryzen 9, RTX 4060, RAM 32GB, layar 165Hz.' },
    { id:2,  storeId:1, name:'Mouse Wireless Logitech MX Master 3S', category:'elektronik', price:1450000, stock:24, sold:512,  rating:4.9, emoji:'🖱️', bg:'#EFF6FF', active:true, description:'Mouse ergonomis dengan scroll presisi tinggi, cocok untuk produktivitas.' },
    { id:3,  storeId:1, name:'Keyboard Mechanical Keychron K8',    category:'elektronik', price:1150000, stock:15, sold:301,  rating:4.7, emoji:'⌨️', bg:'#EFF6FF', active:true, description:'Keyboard mechanical hot-swappable, koneksi wireless & kabel.' },
    { id:4,  storeId:1, name:'Monitor LG UltraGear 27" 165Hz',     category:'elektronik', price:3900000, stock:8,  sold:145,  rating:4.8, emoji:'🖥️', bg:'#EFF6FF', active:true, description:'Monitor gaming QHD 165Hz, response time 1ms, ideal untuk kerja & main game.' },
    { id:5,  storeId:2, name:'Kemeja Batik Tulis Motif Parang',    category:'fashion',    price:285000,  stock:45, sold:1203, rating:4.9, emoji:'👔', bg:'#FFFBEB', active:true, description:'Batik tulis asli Pekalongan, bahan katun primis adem dan halus.' },
    { id:6,  storeId:2, name:'Dress Batik Wanita Modern',          category:'fashion',    price:340000,  stock:22, sold:487,  rating:4.7, emoji:'👗', bg:'#FFFBEB', active:true, description:'Dress batik potongan modern, cocok untuk acara formal maupun kasual.' },
    { id:7,  storeId:2, name:'Selendang Batik Sutra Premium',      category:'fashion',    price:195000,  stock:60, sold:210,  rating:4.6, emoji:'🧣', bg:'#FFFBEB', active:true, description:'Selendang sutra motif batik klasik, ringan dan mewah.' },
    { id:8,  storeId:3, name:'Sepatu Nike Air Max 270 Original',   category:'fashion',    price:1250000, stock:12, sold:567,  rating:4.7, emoji:'👟', bg:'#F0FDF4', active:true, description:'Sepatu running dengan bantalan Air Max, nyaman untuk aktivitas harian.' },
    { id:9,  storeId:3, name:'Jersey Bola Original Musim Ini',     category:'fashion',    price:780000,  stock:18, sold:198,  rating:4.5, emoji:'👕', bg:'#F0FDF4', active:true, description:'Jersey resmi klub, bahan dri-fit menyerap keringat.' },
    { id:10, storeId:3, name:'Tas Ransel Olahraga Anti Air',       category:'fashion',    price:420000,  stock:30, sold:342,  rating:4.6, emoji:'🎒', bg:'#F0FDF4', active:true, description:'Ransel olahraga kapasitas 25L, kompartemen sepatu terpisah.' },
    { id:11, storeId:4, name:'Sony WH-1000XM5 Noise Cancelling',   category:'elektronik', price:4250000, stock:3,  sold:178,  rating:4.9, emoji:'🎧', bg:'#FFF1F2', active:true, description:'Headphone flagship dengan noise cancelling terbaik di kelasnya.' },
    { id:12, storeId:4, name:'JBL Flip 6 Portable Speaker',        category:'elektronik', price:1650000, stock:20, sold:410,  rating:4.7, emoji:'🔊', bg:'#FFF1F2', active:true, description:'Speaker portable tahan air IP67, suara jernih dan bass kuat.' },
    { id:13, storeId:4, name:'AirPods Pro 2nd Generation',         category:'elektronik', price:3600000, stock:9,  sold:389,  rating:4.8, emoji:'🎵', bg:'#FFF1F2', active:true, description:'Earbuds dengan active noise cancellation dan spatial audio.' },
    { id:14, storeId:5, name:'Buku UI/UX Design & Prototyping',    category:'buku',       price:175000,  stock:100,sold:654,  rating:4.7, emoji:'📘', bg:'#F5F3FF', active:true, description:'Panduan lengkap proses desain produk digital dari riset hingga prototipe.' },
    { id:15, storeId:5, name:'Novel Laskar Pelangi (Edisi Baru)',  category:'buku',       price:95000,   stock:80, sold:1044, rating:4.9, emoji:'📖', bg:'#F5F3FF', active:true, description:'Novel klasik Indonesia tentang perjuangan pendidikan di Belitung.' },
    { id:16, storeId:5, name:'Buku Belajar Python untuk Pemula',   category:'buku',       price:135000,  stock:56, sold:288,  rating:4.6, emoji:'📗', bg:'#F5F3FF', active:true, description:'Buku pemrograman Python dari dasar hingga proyek sederhana.' },
    { id:17, storeId:6, name:'Set Panci Anti Lengket 5 Pcs',       category:'rumah',      price:450000,  stock:14, sold:167,  rating:4.5, emoji:'🍳', bg:'#FFF7ED', active:true, description:'Set panci lapisan granite anti lengket, aman untuk semua kompor.' },
    { id:18, storeId:6, name:'Rak Dapur Serbaguna Minimalis',      category:'rumah',      price:220000,  stock:26, sold:203,  rating:4.4, emoji:'🗄️', bg:'#FFF7ED', active:true, description:'Rak susun 3 tingkat, cocok untuk dapur kecil maupun besar.' },
    { id:19, storeId:6, name:'Air Fryer Digital 5L',               category:'rumah',      price:680000,  stock:11, sold:389,  rating:4.8, emoji:'🍟', bg:'#FFF7ED', active:true, description:'Air fryer kapasitas besar dengan 8 mode masak otomatis.' },
    { id:20, storeId:1, name:'Kacamata Blue Light Blocker UV400',  category:'kesehatan',  price:195000,  stock:67, sold:2341, rating:4.5, emoji:'👓', bg:'#ECFEFF', active:true, description:'Kacamata anti radiasi layar, mengurangi mata lelah saat kerja.' },
    { id:21, storeId:4, name:'Jam Tangan Casio G-Shock Original',  category:'elektronik', price:1580000, stock:9,  sold:445,  rating:4.8, emoji:'⌚', bg:'#EFF6FF', active:true, description:'Jam tangan tahan banting, tahan air 200m, garansi resmi.' },
    { id:22, storeId:5, name:'Vitamin C 1000mg Isi 30 Tablet',     category:'kesehatan',  price:85000,   stock:150,sold:980,  rating:4.6, emoji:'💊', bg:'#ECFEFF', active:true, description:'Suplemen vitamin C untuk menjaga daya tahan tubuh harian.' },
    { id:23, storeId:6, name:'Dispenser Air Minum Portable',       category:'rumah',      price:165000,  stock:40, sold:156,  rating:4.3, emoji:'🚰', bg:'#FFF7ED', active:true, description:'Dispenser praktis untuk galon, hemat listrik dan ruang.' },
    { id:24, storeId:2, name:'Sarung Tenun Songket Premium',       category:'fashion',    price:520000,  stock:15, sold:88,   rating:4.7, emoji:'🧵', bg:'#FFFBEB', active:true, description:'Sarung tenun songket motif tradisional, tenunan tangan asli.' },
  ];

  const usersInternal = [
    { username:'budi',  password:'demo', name:'Budi Santoso',   roles:['buyer'],           storeId:null },
    { username:'ahmad', password:'demo', name:'Ahmad Fauzi',    roles:['seller'],          storeId:1 },
    { username:'rudi',  password:'demo', name:'Rudi Hermawan',  roles:['buyer','seller'],  storeId:2 },
    { username:'dewi',  password:'demo', name:'Dewi Anggraini', roles:['driver'],          storeId:null },
    { username:'admin', password:'demo', name:'Super Admin',    roles:['admin'],           storeId:null },
    { username:'bima',  password:'demo', name:'Bima Kurnia',    roles:['seller'],          storeId:3 },
    { username:'yuni',  password:'demo', name:'Yuni Pratiwi',   roles:['seller'],          storeId:4 },
  ];

  const orders = [
    { id:101, code:'#SP-1001', buyerUsername:'budi', storeId:1, storeName:'TechStore Jakarta',
      items:[{productId:1,name:'Laptop ASUS ROG Zephyrus G14 2024',price:14500000,qty:1,emoji:'💻'}],
      subtotal:14500000, discountAmount:0, discountLabel:null, deliveryMethod:'instant', deliveryFee:25000, ppn:Math.round(14500000*0.12), total:14500000+25000+Math.round(14500000*0.12),
      status:'Sedang Dikirim', driverUsername:'dewi', createdAt: hoursAgo(1),
      statusHistory:[
        { status:'Sedang Dikemas', at: hoursAgo(4) },
        { status:'Menunggu Pengirim', at: hoursAgo(2) },
        { status:'Sedang Dikirim', at: hoursAgo(1) },
      ] },
    { id:102, code:'#SP-1002', buyerUsername:'budi', storeId:2, storeName:'Batik Nusantara',
      items:[{productId:5,name:'Kemeja Batik Tulis Motif Parang',price:285000,qty:2,emoji:'👔'}],
      subtotal:570000, discountAmount:25000, discountLabel:'Promo DISKON25K', deliveryMethod:'regular', deliveryFee:9000, ppn:Math.round((570000-25000)*0.12), total:(570000-25000)+9000+Math.round((570000-25000)*0.12),
      status:'Menunggu Pengirim', driverUsername:null, createdAt: hoursAgo(3),
      statusHistory:[
        { status:'Sedang Dikemas', at: hoursAgo(5) },
        { status:'Menunggu Pengirim', at: hoursAgo(3) },
      ] },
    { id:103, code:'#SP-1003', buyerUsername:'rudi', storeId:1, storeName:'TechStore Jakarta',
      items:[{productId:11,name:'Sony WH-1000XM5 Noise Cancelling',price:4250000,qty:1,emoji:'🎧'}],
      subtotal:4250000, discountAmount:0, discountLabel:null, deliveryMethod:'next_day', deliveryFee:15000, ppn:Math.round(4250000*0.12), total:4250000+15000+Math.round(4250000*0.12),
      status:'Pesanan Selesai', driverUsername:'dewi', createdAt: daysAgo(4),
      statusHistory:[
        { status:'Sedang Dikemas', at: daysAgo(4) },
        { status:'Menunggu Pengirim', at: daysAgo(4) },
        { status:'Sedang Dikirim', at: daysAgo(3) },
        { status:'Pesanan Selesai', at: daysAgo(3) },
      ] },
    { id:104, code:'#SP-1004', buyerUsername:'budi', storeId:3, storeName:'Sport Station ID',
      items:[{productId:8,name:'Sepatu Nike Air Max 270 Original',price:1250000,qty:1,emoji:'👟'}],
      subtotal:1250000, discountAmount:0, discountLabel:null, deliveryMethod:'regular', deliveryFee:9000, ppn:Math.round(1250000*0.12), total:1250000+9000+Math.round(1250000*0.12),
      status:'Sedang Dikemas', driverUsername:null, createdAt: hoursAgo(0.5),
      statusHistory:[ { status:'Sedang Dikemas', at: hoursAgo(0.5) } ] },
    { id:105, code:'#SP-1005', buyerUsername:'rudi', storeId:4, storeName:'Audio World ID',
      items:[{productId:12,name:'JBL Flip 6 Portable Speaker',price:1650000,qty:1,emoji:'🔊'}],
      subtotal:1650000, discountAmount:0, discountLabel:null, deliveryMethod:'regular', deliveryFee:9000, ppn:Math.round(1650000*0.12), total:1650000+9000+Math.round(1650000*0.12),
      status:'Menunggu Pengirim', driverUsername:null, createdAt: daysAgo(5), // intentionally old -> overdue vs regular 72h SLA
      statusHistory:[
        { status:'Sedang Dikemas', at: daysAgo(5) },
        { status:'Menunggu Pengirim', at: daysAgo(5) },
      ] },
  ];

  orders.forEach(o => {
    if (!o.slaDeadline) o.slaDeadline = hoursFromNow(o.createdAt, (DELIVERY_META[o.deliveryMethod] || DELIVERY_META.regular).slaHours);
    if (o.refunded === undefined) o.refunded = false;
  });

  const deliveryJobs = [
    { orderId:101, status:'taken',     driverUsername:'dewi', takenAt: hoursAgo(1), completedAt:null },
    { orderId:102, status:'available', driverUsername:null,   takenAt:null,          completedAt:null },
    { orderId:103, status:'completed', driverUsername:'dewi', takenAt: daysAgo(3),   completedAt: daysAgo(3) },
    { orderId:105, status:'available', driverUsername:null,   takenAt:null,          completedAt:null },
  ];

  const vouchers = [
    { code:'ONGKIR10',  type:'voucher', label:'Gratis Ongkir',        discountType:'freeship', value:0,   maxDiscount:null,  expiry: hoursFromNow(now, 24*30), usageLimit:100, usedCount:37 },
    { code:'HEMAT15',   type:'voucher', label:'Diskon 15% Belanja',   discountType:'percent',  value:15,  maxDiscount:50000, expiry: hoursFromNow(now, 24*20), usageLimit:50,  usedCount:34 },
    { code:'EXPIRED5',  type:'voucher', label:'Diskon 5% (Expired)',  discountType:'percent',  value:5,   maxDiscount:20000, expiry: daysAgo(10),               usageLimit:20,  usedCount:20 },
  ];

  const promos = [
    { code:'DISKON25K', type:'promo', label:'Potongan Rp 25.000',   discountType:'fixed',   value:25000, maxDiscount:null,  minPurchase:100000, expiry: hoursFromNow(now, 24*15) },
    { code:'YUKBELANJA',type:'promo', label:'Promo 10% Akhir Bulan',discountType:'percent', value:10,    maxDiscount:30000, minPurchase:50000,  expiry: hoursFromNow(now, 24*10) },
  ];

  const addresses = [
    { id:1, label:'Rumah Utama', detail:'Jl. Sudirman No. 45, RT 003/RW 002, Tanah Abang, Jakarta Pusat 10250', phone:'+62 812-3456-7890', isDefault:true },
    { id:2, label:'Kantor',      detail:'Menara BCA Lt. 22, Jl. MH Thamrin No. 1, Jakarta Pusat 10310',          phone:'+62 812-3456-7890', isDefault:false },
  ];

  const wallet = {
    balance: 2500000,
    transactions: [
      { id:1, type:'credit', desc:'Top Up via BCA Virtual Account', amount:3000000, at: daysAgo(6) },
      { id:2, type:'debit',  desc:'Checkout order #SP-1003',        amount:4250000+15000+Math.round(4250000*0.12), at: daysAgo(4) },
      { id:3, type:'credit', desc:'Cashback promo member',          amount:50000,   at: daysAgo(3) },
      { id:4, type:'debit',  desc:'Checkout order #SP-1001',        amount:14500000+25000+Math.round(14500000*0.12), at: hoursAgo(4) },
      { id:5, type:'credit', desc:'Top Up via GoPay',                amount:500000,  at: hoursAgo(4) },
    ],
  };

  const reviews = [
    { id:1, name:'Budi Santoso', rating:5, comment:'Pengiriman super cepat! Barang sampai dalam kondisi sempurna dan sesuai deskripsi.', date: daysAgo(2) },
    { id:2, name:'Siti Rahayu',  rating:5, comment:'Sudah beberapa kali belanja di SEAPEDIA dan selalu puas. Harga kompetitif!',           date: daysAgo(5) },
    { id:3, name:'Ahmad Fauzi',  rating:4, comment:'UI-nya clean banget dan mudah digunakan. Proses checkout simpel.',                     date: daysAgo(7) },
  ];

  return {
    currentUser: null,
    users: usersInternal,
    stores, products, orders, deliveryJobs, vouchers, promos, addresses, wallet, reviews,
    cart: null, // { storeId, storeName, items: [{productId, qty}] }
    simulatedNow: iso(now),
    simDaysAdvanced: 0,
  };
}

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { const db = seed(); localStorage.setItem(KEY, JSON.stringify(db)); return db; }
    return JSON.parse(raw);
  } catch (e) {
    const db = seed(); localStorage.setItem(KEY, JSON.stringify(db)); return db;
  }
}

export function save(db) { localStorage.setItem(KEY, JSON.stringify(db)); }
export function reset() { const db = seed(); save(db); return db; }

export function fmt(n) { return 'Rp\u00a0' + Math.round(n || 0).toLocaleString('id-ID'); }
export function fmtDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) + ' · ' + d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
}
export function now(db) { return db.simulatedNow || iso(new Date()); }

// ── Auth ──────────────────────────────────────────────────────────────
export function login(db, username, password) {
  const u = db.users.find(x => x.username.toLowerCase() === String(username).toLowerCase());
  if (!u) return { ok:false, error:'Username tidak ditemukan' };
  if (password && u.password !== password) return { ok:false, error:'Password salah' };
  db.currentUser = { username:u.username, name:u.name, roles:u.roles, activeRole: u.roles.length === 1 ? u.roles[0] : null, storeId:u.storeId };
  save(db);
  return { ok:true, user: db.currentUser };
}
export function register(db, { name, username, password, role }) {
  if (db.users.some(x => x.username.toLowerCase() === String(username).toLowerCase())) return { ok:false, error:'Username sudah digunakan' };
  const u = { username, password, name, roles:[role], storeId:null };
  db.users.push(u);
  db.currentUser = { username:u.username, name:u.name, roles:u.roles, activeRole: role, storeId:null };
  save(db);
  return { ok:true, user: db.currentUser };
}
export function selectRole(db, role) {
  if (!db.currentUser) return;
  db.currentUser.activeRole = role;
  save(db);
}
export function logout(db) {
  db.currentUser = null;
  save(db);
}
export function getUserRecord(db, username) {
  return db.users.find(u => u.username === username) || null;
}

// ── Catalog ───────────────────────────────────────────────────────────
export function listProducts(db, { search='', category='semua', sort='relevance', page=1, pageSize=12 } = {}) {
  let items = db.products.filter(p => p.active);
  if (category && category !== 'semua') items = items.filter(p => p.category === category);
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(p => p.name.toLowerCase().includes(s));
  }
  items = items.map(p => ({ ...p, storeName: (db.stores.find(s => s.id === p.storeId) || {}).name || '' }));
  if (sort === 'price_asc') items = items.slice().sort((a,b) => a.price - b.price);
  else if (sort === 'price_desc') items = items.slice().sort((a,b) => b.price - a.price);
  else if (sort === 'rating') items = items.slice().sort((a,b) => b.rating - a.rating);
  else if (sort === 'sold') items = items.slice().sort((a,b) => b.sold - a.sold);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, totalPages, page };
}
export function getProduct(db, id) {
  const p = db.products.find(x => x.id === Number(id));
  if (!p) return null;
  const store = db.stores.find(s => s.id === p.storeId) || null;
  return { ...p, store };
}
export function getStore(db, id) { return db.stores.find(s => s.id === Number(id)) || null; }
export function listStoreProducts(db, storeId, excludeId) {
  return db.products.filter(p => p.storeId === Number(storeId) && p.active && p.id !== Number(excludeId));
}

// ── Seller: store & products ─────────────────────────────────────────
export function createStore(db, { name, category, description, ownerUsername }) {
  const exists = db.stores.some(s => s.name.trim().toLowerCase() === name.trim().toLowerCase());
  if (exists) return { ok:false, error:'Nama toko sudah digunakan, coba nama lain.' };
  const id = Math.max(0, ...db.stores.map(s => s.id)) + 1;
  const store = { id, name: name.trim(), ownerUsername, category, logo:'🏪', rating:5.0, verified:false, followers:0, description: description || '' };
  db.stores.push(store);
  const u = getUserRecord(db, ownerUsername);
  if (u) u.storeId = id;
  if (db.currentUser && db.currentUser.username === ownerUsername) db.currentUser.storeId = id;
  save(db);
  return { ok:true, store };
}
export function updateStore(db, storeId, patch) {
  if (patch.name) {
    const dup = db.stores.some(s => s.id !== Number(storeId) && s.name.trim().toLowerCase() === patch.name.trim().toLowerCase());
    if (dup) return { ok:false, error:'Nama toko sudah digunakan, coba nama lain.' };
  }
  const s = db.stores.find(x => x.id === Number(storeId));
  if (!s) return { ok:false, error:'Toko tidak ditemukan' };
  Object.assign(s, patch);
  save(db);
  return { ok:true, store:s };
}
export function createProduct(db, { storeId, name, price, stock, category, description, emoji }) {
  const id = Math.max(0, ...db.products.map(p => p.id)) + 1;
  const p = { id, storeId:Number(storeId), name, category, price:Number(price), stock:Number(stock), sold:0, rating:5.0, emoji: emoji || '🏷️', bg:'#F1F5F9', active:true, description: description || '' };
  db.products.push(p);
  save(db);
  return p;
}
export function updateProduct(db, productId, patch) {
  const p = db.products.find(x => x.id === Number(productId));
  if (!p) return { ok:false, error:'Produk tidak ditemukan' };
  Object.assign(p, patch);
  save(db);
  return { ok:true, product:p };
}
export function deleteProduct(db, productId) {
  db.products = db.products.filter(p => p.id !== Number(productId));
  save(db);
}

// ── Buyer: wallet & address ──────────────────────────────────────────
export function topUp(db, amount, method) {
  db.wallet.balance += Number(amount);
  db.wallet.transactions.unshift({ id: Date.now(), type:'credit', desc:`Top Up via ${method || 'Bank Transfer'}`, amount:Number(amount), at: now(db) });
  save(db);
  return db.wallet;
}
export function addAddress(db, addr) {
  const id = Math.max(0, ...db.addresses.map(a => a.id)) + 1;
  const isDefault = db.addresses.length === 0;
  db.addresses.push({ id, isDefault, ...addr });
  save(db);
}
export function deleteAddress(db, id) {
  db.addresses = db.addresses.filter(a => a.id !== Number(id));
  save(db);
}
export function setDefaultAddress(db, id) {
  db.addresses.forEach(a => a.isDefault = a.id === Number(id));
  save(db);
}

// ── Cart (single-store rule) ─────────────────────────────────────────
export function addToCart(db, product, qty=1) {
  if (db.cart && db.cart.storeId !== product.storeId) {
    return { ok:false, error:'different_store', cartStoreName: db.cart.storeName };
  }
  if (!db.cart) db.cart = { storeId: product.storeId, storeName: (db.stores.find(s=>s.id===product.storeId)||{}).name || '', items: [] };
  const existing = db.cart.items.find(i => i.productId === product.id);
  if (existing) existing.qty += qty;
  else db.cart.items.push({ productId: product.id, qty });
  save(db);
  return { ok:true };
}
export function updateCartQty(db, productId, qty) {
  if (!db.cart) return;
  const it = db.cart.items.find(i => i.productId === Number(productId));
  if (!it) return;
  it.qty = Math.max(1, qty);
  save(db);
}
export function removeFromCart(db, productId) {
  if (!db.cart) return;
  db.cart.items = db.cart.items.filter(i => i.productId !== Number(productId));
  if (db.cart.items.length === 0) db.cart = null;
  save(db);
}
export function clearCart(db) { db.cart = null; save(db); }
export function getCartSummary(db) {
  if (!db.cart) return { items: [], subtotal: 0, storeId:null, storeName:null };
  const items = db.cart.items.map(i => {
    const p = db.products.find(x => x.id === i.productId);
    return p ? { ...i, name:p.name, price:p.price, emoji:p.emoji, bg:p.bg, stock:p.stock } : null;
  }).filter(Boolean);
  const subtotal = items.reduce((a,i) => a + i.price * i.qty, 0);
  return { items, subtotal, storeId: db.cart.storeId, storeName: db.cart.storeName };
}

// ── Discounts ─────────────────────────────────────────────────────────
export function validateDiscount(db, code, subtotal) {
  if (!code) return { ok:true, discount:null };
  const c = code.trim().toUpperCase();
  const v = db.vouchers.find(x => x.code === c);
  const p = db.promos.find(x => x.code === c);
  const item = v || p;
  if (!item) return { ok:false, error:'Kode tidak ditemukan' };
  if (new Date(item.expiry) < new Date(now(db))) return { ok:false, error:'Kode sudah kedaluwarsa' };
  if (v && v.usedCount >= v.usageLimit) return { ok:false, error:'Kuota voucher sudah habis' };
  if (p && p.minPurchase && subtotal < p.minPurchase) return { ok:false, error:`Minimum belanja ${fmt(p.minPurchase)} untuk promo ini` };
  let amount = 0;
  if (item.discountType === 'percent') { amount = Math.round(subtotal * item.value / 100); if (item.maxDiscount) amount = Math.min(amount, item.maxDiscount); }
  else if (item.discountType === 'fixed') amount = item.value;
  else if (item.discountType === 'freeship') amount = 0; // handled by zeroing delivery fee
  return { ok:true, discount: { code: item.code, kind: v ? 'voucher' : 'promo', label: item.label, discountType: item.discountType, amount } };
}

export function computeCheckout(db, { deliveryMethod, discountCode }) {
  const cart = getCartSummary(db);
  const meta = DELIVERY_META[deliveryMethod] || DELIVERY_META.regular;
  const discRes = validateDiscount(db, discountCode, cart.subtotal);
  const discount = discRes.ok ? discRes.discount : null;
  const discountAmount = discount ? discount.amount : 0;
  const deliveryFee = (discount && discount.discountType === 'freeship') ? 0 : meta.fee;
  const taxBase = Math.max(0, cart.subtotal - discountAmount);
  const ppn = Math.round(taxBase * 0.12);
  const total = taxBase + deliveryFee + ppn;
  return { ...cart, deliveryMethod, deliveryFeeLabel: meta.label, deliveryFee, discount, discountAmount, ppn, total, discountError: discRes.ok ? null : discRes.error };
}

// ── Checkout / Orders ────────────────────────────────────────────────
export function checkout(db, { deliveryMethod, discountCode, addressId }) {
  const calc = computeCheckout(db, { deliveryMethod, discountCode });
  if (calc.items.length === 0) return { ok:false, error:'Keranjang kosong' };
  if (calc.discountError) return { ok:false, error: calc.discountError };
  if (db.wallet.balance < calc.total) return { ok:false, error:'Saldo dompet tidak cukup' };
  for (const it of calc.items) {
    const p = db.products.find(x => x.id === it.productId);
    if (!p || p.stock < it.qty) return { ok:false, error:`Stok "${it.name}" tidak cukup` };
  }
  calc.items.forEach(it => { const p = db.products.find(x => x.id === it.productId); p.stock -= it.qty; p.sold = (p.sold||0) + it.qty; });
  db.wallet.balance -= calc.total;
  const id = Math.max(0, ...db.orders.map(o => o.id)) + 1;
  const code = '#SP-' + (1000 + id);
  const meta = DELIVERY_META[deliveryMethod] || DELIVERY_META.regular;
  const createdAt = now(db);
  const order = {
    id, code, buyerUsername: db.currentUser ? db.currentUser.username : 'guest',
    storeId: calc.storeId, storeName: calc.storeName,
    items: calc.items.map(i => ({ productId:i.productId, name:i.name, price:i.price, qty:i.qty, emoji:i.emoji })),
    subtotal: calc.subtotal, discountAmount: calc.discountAmount, discountLabel: calc.discount ? `${calc.discount.kind === 'voucher' ? 'Voucher' : 'Promo'} ${calc.discount.label}` : null,
    deliveryMethod, deliveryFee: calc.deliveryFee, ppn: calc.ppn, total: calc.total,
    status: 'Sedang Dikemas', driverUsername: null, createdAt,
    slaDeadline: hoursFromNow(createdAt, meta.slaHours),
    addressId: addressId || (db.addresses.find(a=>a.isDefault)||{}).id || null,
    statusHistory: [{ status:'Sedang Dikemas', at: createdAt }],
    refunded: false,
  };
  db.orders.push(order);
  db.wallet.transactions.unshift({ id: Date.now(), type:'debit', desc:`Checkout order ${code}`, amount: calc.total, at: createdAt });
  if (calc.discount) {
    const v = db.vouchers.find(x => x.code === calc.discount.code);
    if (v) v.usedCount += 1;
  }
  db.cart = null;
  save(db);
  return { ok:true, order };
}

export function listOrders(db, { buyerUsername, storeId, status, driverUsername } = {}) {
  let items = db.orders.slice();
  if (buyerUsername) items = items.filter(o => o.buyerUsername === buyerUsername);
  if (storeId) items = items.filter(o => o.storeId === Number(storeId));
  if (status) items = items.filter(o => o.status === status);
  if (driverUsername) items = items.filter(o => o.driverUsername === driverUsername);
  return items.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
}
export function getOrder(db, id) { return db.orders.find(o => o.id === Number(id)) || null; }

// ── Seller order processing ─────────────────────────────────────────
export function processOrder(db, orderId) {
  const o = getOrder(db, orderId);
  if (!o) return { ok:false, error:'Pesanan tidak ditemukan' };
  if (o.status !== 'Sedang Dikemas') return { ok:false, error:'Pesanan tidak dalam status Sedang Dikemas' };
  o.status = 'Menunggu Pengirim';
  o.statusHistory.push({ status:'Menunggu Pengirim', at: now(db) });
  db.deliveryJobs.push({ orderId: o.id, status:'available', driverUsername:null, takenAt:null, completedAt:null });
  save(db);
  return { ok:true, order:o };
}

// ── Driver jobs ───────────────────────────────────────────────────────
export function listAvailableJobs(db) {
  return db.deliveryJobs.filter(j => j.status === 'available').map(j => ({ ...j, order: getOrder(db, j.orderId) })).filter(j => j.order);
}
export function listDriverJobs(db, driverUsername) {
  return db.deliveryJobs.filter(j => j.driverUsername === driverUsername).map(j => ({ ...j, order: getOrder(db, j.orderId) })).filter(j => j.order);
}
export function takeJob(db, orderId, driverUsername) {
  const job = db.deliveryJobs.find(j => j.orderId === Number(orderId));
  if (!job || job.status !== 'available') return { ok:false, error:'Job sudah diambil driver lain' };
  job.status = 'taken'; job.driverUsername = driverUsername; job.takenAt = now(db);
  const o = getOrder(db, orderId);
  o.status = 'Sedang Dikirim'; o.driverUsername = driverUsername;
  o.statusHistory.push({ status:'Sedang Dikirim', at: now(db) });
  save(db);
  return { ok:true };
}
export function completeJob(db, orderId) {
  const job = db.deliveryJobs.find(j => j.orderId === Number(orderId));
  if (!job) return { ok:false, error:'Job tidak ditemukan' };
  job.status = 'completed'; job.completedAt = now(db);
  const o = getOrder(db, orderId);
  o.status = 'Pesanan Selesai';
  o.statusHistory.push({ status:'Pesanan Selesai', at: now(db) });
  save(db);
  return { ok:true };
}
export function driverEarning(order) { return Math.round((order.deliveryFee || 0) * 0.8); }

// ── Admin: vouchers & promos ─────────────────────────────────────────
export function generateVoucher(db, data) {
  const code = (data.code || ('VCR' + Math.floor(1000 + Math.random()*9000))).toUpperCase();
  const v = { code, type:'voucher', label:data.label, discountType:data.discountType, value:Number(data.value)||0, maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null, expiry:data.expiry, usageLimit:Number(data.usageLimit)||100, usedCount:0 };
  db.vouchers.unshift(v);
  save(db);
  return v;
}
export function generatePromo(db, data) {
  const code = (data.code || ('PROMO' + Math.floor(1000 + Math.random()*9000))).toUpperCase();
  const p = { code, type:'promo', label:data.label, discountType:data.discountType, value:Number(data.value)||0, maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null, minPurchase: Number(data.minPurchase)||0, expiry:data.expiry };
  db.promos.unshift(p);
  save(db);
  return p;
}

// ── Overdue simulation (Admin) ────────────────────────────────────────
export function simulateNextDay(db, hours=24) {
  db.simulatedNow = hoursFromNow(now(db), hours);
  db.simDaysAdvanced = (db.simDaysAdvanced || 0) + 1;
  const nowT = new Date(db.simulatedNow).getTime();
  const affected = [];
  db.orders.forEach(o => {
    if (['Pesanan Selesai', 'Dikembalikan'].includes(o.status)) return;
    if (!o.slaDeadline) return;
    if (nowT > new Date(o.slaDeadline).getTime() && !o.refunded) {
      // Auto refund/return
      db.wallet.balance += o.total;
      db.wallet.transactions.unshift({ id: Date.now() + o.id, type:'credit', desc:`Refund otomatis order ${o.code} (overdue)`, amount:o.total, at: db.simulatedNow });
      o.items.forEach(it => { const p = db.products.find(x => x.id === it.productId); if (p) p.stock += it.qty; });
      o.status = 'Dikembalikan';
      o.refunded = true;
      o.statusHistory.push({ status:'Dikembalikan', at: db.simulatedNow });
      const job = db.deliveryJobs.find(j => j.orderId === o.id);
      if (job && job.status !== 'completed') job.status = 'cancelled';
      affected.push(o);
    }
  });
  save(db);
  return { ok:true, affected, simulatedNow: db.simulatedNow };
}

// ── Reviews (public, XSS-safe by virtue of text-only rendering) ──────
export function addReview(db, { name, rating, comment }) {
  const safeName = String(name || 'Anonim').slice(0, 60);
  const safeComment = String(comment || '').slice(0, 500);
  const r = { id: Date.now(), name: safeName, rating: Math.max(1, Math.min(5, Number(rating)||5)), comment: safeComment, at: now(db) };
  db.reviews.unshift(r);
  save(db);
  return r;
}
export function listReviews(db) { return db.reviews.slice().sort((a,b) => new Date(b.at||b.date) - new Date(a.at||a.date)); }

// ── Admin monitoring aggregates ───────────────────────────────────────
export function adminStats(db) {
  const totalGMV = db.orders.filter(o => o.status === 'Pesanan Selesai').reduce((a,o)=>a+o.total,0);
  const overdueCandidates = db.orders.filter(o => !['Pesanan Selesai','Dikembalikan'].includes(o.status) && o.slaDeadline && new Date(now(db)) > new Date(o.slaDeadline));
  return {
    totalUsers: db.users.length,
    totalStores: db.stores.length,
    verifiedStores: db.stores.filter(s=>s.verified).length,
    totalProducts: db.products.length,
    totalOrders: db.orders.length,
    activeOrders: db.orders.filter(o => !['Pesanan Selesai','Dikembalikan'].includes(o.status)).length,
    completedOrders: db.orders.filter(o => o.status === 'Pesanan Selesai').length,
    returnedOrders: db.orders.filter(o => o.status === 'Dikembalikan').length,
    totalGMV,
    totalVouchers: db.vouchers.length,
    totalPromos: db.promos.length,
    availableJobs: db.deliveryJobs.filter(j=>j.status==='available').length,
    activeJobs: db.deliveryJobs.filter(j=>j.status==='taken').length,
    overdueCount: overdueCandidates.length,
    overdueOrders: overdueCandidates,
  };
}
