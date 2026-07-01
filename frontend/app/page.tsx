'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import {
  ShoppingBag, Star, Package, Store, Truck, ArrowRight, ShieldCheck,
  Zap, Users, BadgeCheck, Headphones, Heart, ShoppingCart, ChevronRight, Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

// ---------- constants ----------
const STATS = [
  { icon: Package,    value: '10.000+', label: 'Produk Tersedia' },
  { icon: Store,      value: '2.000+',  label: 'Penjual Aktif' },
  { icon: Users,      value: '50.000+', label: 'Pembeli Puas' },
  { icon: ShieldCheck,value: '99.9%',   label: 'Transaksi Aman' },
];

const BRANDS = ['Vivo', 'Lenovo', 'HP', 'Samsung', 'Apple', 'ASUS', 'Nike', 'Adidas', 'Sony', 'Xiaomi', 'Oppo', 'JBL', 'Polytron', 'Sharp'];

const CATEGORIES = [
  { label: 'Elektronik',    color: 'bg-blue-50',   icon: Zap,         iconColor: 'text-blue-500' },
  { label: 'Fashion',       color: 'bg-pink-50',   icon: Heart,       iconColor: 'text-pink-500' },
  { label: 'Kesehatan',     color: 'bg-green-50',  icon: ShieldCheck, iconColor: 'text-green-500' },
  { label: 'Perlengkapan',  color: 'bg-amber-50',  icon: Package,     iconColor: 'text-amber-500' },
  { label: 'Toko Semua',    color: 'bg-purple-50', icon: Store,       iconColor: 'text-purple-500' },
];

const TRUST = [
  { icon: Truck,       title: 'Pengiriman Cepat',  desc: 'Instant, Next Day, Reguler' },
  { icon: ShieldCheck, title: 'Bayar Aman',        desc: 'Dana terlindungi hingga pesanan diterima' },
  { icon: ArrowRight,  title: 'Garansi Return',    desc: 'Refund otomatis ke dompet' },
  { icon: Headphones,  title: 'Support 24/7',      desc: 'Tim CS siap membantu kapan saja' },
];

// ---------- countdown ----------
function useCountdown() {
  const [time, setTime] = useState({ h: 10, m: 55, s: 0 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 10, m: 55, s: 0 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(time.h)}:${pad(time.m)}:${pad(time.s)}`;
}

// ---------- review form state ----------
interface ReviewForm { reviewerName: string; comment: string; rating: number }

export default function HomePage() {
  const { user } = useAuthStore();
  const [products, setProducts]   = useState<any[]>([]);
  const [reviews, setReviews]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [wishlist, setWishlist]   = useState<Set<string>>(new Set());
  const [adding, setAdding]       = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({ reviewerName: '', comment: '', rating: 0 });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const countdown = useCountdown();

  useEffect(() => {
    Promise.all([api.get('/products?limit=8'), api.get('/reviews')])
      .then(([p, r]) => {
        setProducts(p.data.data.products);
        setReviews(r.data.data.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!user || user.activeRole !== 'BUYER') {
      toast.error('Login sebagai Pembeli untuk menambahkan ke keranjang');
      return;
    }
    setAdding(productId);
    try {
      await api.post('/buyer/cart/items', { productId, quantity: 1 });
      toast.success('Ditambahkan ke keranjang');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal');
    } finally {
      setAdding(null);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.rating) { toast.error('Pilih rating bintang'); return; }
    setReviewLoading(true);
    try {
      await api.post('/reviews', reviewForm);
      toast.success('Ulasan berhasil dikirim!');
      setReviewForm({ reviewerName: '', comment: '', rating: 0 });
      const r = await api.get('/reviews');
      setReviews(r.data.data.slice(0, 3));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengirim ulasan');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500 text-white min-h-[480px] flex items-center overflow-hidden">
        {/* blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-900/30 rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative container mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500 rounded-full px-3 py-1 text-xs font-bold mb-5">
              <Zap className="w-3 h-3 fill-white" /> Flash Sale Aktif! <span className="bg-white/20 rounded px-1.5 py-0.5">{countdown}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Belanja Lebih Mudah<br />
              <span className="text-yellow-300">&amp; Hemat</span> di SEAPEDIA
            </h1>
            <p className="text-blue-100 text-base mb-7 max-w-sm leading-relaxed">
              Ribuan produk dari penjual terpercaya. Pengiriman cepat, harga bersaing, dan transaksi 100% aman terjamin.
            </p>
            <div className="flex gap-3 flex-wrap mb-6">
              <Link href="/products">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-bold shadow-lg">
                  <ShoppingCart className="w-4 h-4 mr-1.5" /> Belanja Sekarang
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20 font-semibold">
                  Daftar Gratis <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {/* trust badges */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-blue-100">
              <span className="flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5 text-green-300" /> Gratis ongkir min.</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-green-300" /> Bayar aman</span>
              <span className="flex items-center gap-1"><ArrowRight className="w-3.5 h-3.5 text-green-300" /> Garansi return</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" /> Rating 4.9/5</span>
            </div>
          </div>

          {/* Right — illustration card */}
          <div className="hidden md:flex flex-col items-center justify-center relative">
            <div className="w-56 h-56 bg-yellow-400 rounded-3xl flex items-center justify-center shadow-2xl relative">
              <ShoppingBag className="w-24 h-24 text-yellow-600" />
              <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <Package className="w-7 h-7 text-blue-500" />
              </div>
            </div>
            {/* floating card */}
            <div className="absolute bottom-0 right-0 bg-white text-gray-800 rounded-2xl shadow-xl px-4 py-3 text-sm">
              <p className="text-xs text-gray-500">Pesanan Selesai</p>
              <p className="font-bold text-green-600">+Rp 1.250.000</p>
            </div>
            {/* online badge */}
            <div className="absolute top-0 right-0 bg-white/90 text-gray-700 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              1.247 orang online
            </div>
          </div>
        </div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" className="w-full h-12 fill-gray-50">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND TICKER ── */}
      <div className="bg-primary py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="mx-6 text-white/80 text-sm font-medium flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300 flex-shrink-0" /> {b}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Jelajahi Kategori</h2>
          <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            Lihat semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {CATEGORIES.map(({ label, color, icon: Icon, iconColor }) => (
            <Link key={label} href={`/products?search=${label === 'Toko Semua' ? '' : label}`}>
              <div className={`${color} rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5`}>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FLASH SALE ── */}
      <section className="mx-4 md:mx-8 lg:mx-16 mb-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 fill-white" />
            <span className="text-lg font-bold">FLASH SALE</span>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1.5 font-mono font-bold text-white text-base">
            {countdown}
          </div>
          <span className="text-white/80 text-sm">Penawaran terbatas! Berakhir dalam:</span>
          <Link href="/products" className="ml-auto">
            <Button size="sm" className="bg-white text-orange-500 hover:bg-orange-50 font-semibold">
              Lihat Semua <ChevronRight className="w-4 h-4 ml-0.5" />
            </Button>
          </Link>
        </div>
        {!loading && (
          <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            {products.slice(0, 4).map((p, i) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <div className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-50 relative flex items-center justify-center">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      : <Package className="w-10 h-10 text-gray-300" />
                    }
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      -{10 + i * 5}%
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-800 line-clamp-1">{p.name}</p>
                    <p className="text-sm font-bold text-red-500 mt-0.5">{formatRupiah(p.price)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="container mx-auto px-4 pb-14">
        <div className="flex items-center gap-1 mb-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Pilihan Terbaik</span>
        </div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Produk Terbaru</h2>
          <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            Lihat semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p.id} className="group bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
                <Link href={`/products/${p.id}`}>
                  <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <Package className="w-14 h-14 text-gray-200" />
                    }
                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">TERLARIS</span>
                    <button
                      onClick={e => { e.preventDefault(); setWishlist(s => { const n = new Set(s); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; }); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
                    >
                      <Heart className={`w-3.5 h-3.5 ${wishlist.has(p.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                  </div>
                </Link>
                <div className="p-3">
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                    <Store className="w-3 h-3" /> {p.store?.name}
                  </p>
                  <Link href={`/products/${p.id}`}>
                    <p className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug hover:text-primary transition-colors">{p.name}</p>
                  </Link>
                  {/* dummy stars */}
                  <div className="flex items-center gap-0.5 my-1.5">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">4.9</span>
                  </div>
                  <p className="text-primary font-bold text-sm">{formatRupiah(p.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">Stok: {p.stock}</span>
                    <button
                      onClick={() => handleAddToCart(p.id)}
                      disabled={p.stock === 0 || adding === p.id}
                      className="text-xs bg-primary text-white px-2.5 py-1 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {adding === p.id ? '...' : p.stock === 0 ? 'Habis' : '+ Keranjang'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── TRUST ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-8">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-14 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Ulasan Pengguna</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Apa Kata Mereka?</h2>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {Array(5).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              <span className="text-sm font-bold text-gray-700 ml-1">4.9</span>
              <span className="text-sm text-gray-400">dari 50.000+ ulasan</span>
            </div>
          </div>

          {/* Review cards */}
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 col-span-3 text-center py-4">Belum ada ulasan. Jadilah yang pertama!</p>
            ) : reviews.map((r) => (
              <Card key={r.id} className="border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <Quote className="w-6 h-6 text-primary/20 mb-3 fill-primary/10" />
                  <div className="flex items-center gap-1 mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">&ldquo;{r.comment}&rdquo;</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{r.reviewerName?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.reviewerName}</p>
                      <p className="text-xs text-gray-400">Pembeli SEAPEDIA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Review form */}
          <div className="max-w-2xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <h3 className="font-bold text-gray-900">Bagikan Pengalamanmu</h3>
            </div>
            <p className="text-xs text-gray-500 mb-5">Ulasanmu membantu jutaan pembeli membuat keputusan yang lebih baik!</p>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Nama</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Nama lengkapmu..."
                    value={reviewForm.reviewerName}
                    onChange={e => setReviewForm(f => ({ ...f, reviewerName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Rating</label>
                  <div className="flex items-center gap-1 mt-1">
                    {Array(5).fill(0).map((_, i) => (
                      <button
                        key={i} type="button"
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewForm(f => ({ ...f, rating: i + 1 }))}
                      >
                        <Star className={`w-6 h-6 transition-colors ${
                          i < (hoverRating || reviewForm.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-100 text-gray-300'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Komentar</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  rows={3}
                  placeholder="Ceritakan pengalamanmu berbelanja di SEAPEDIA..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full font-semibold" disabled={reviewLoading}>
                {reviewLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-white" /> Kirim Ulasan
                  </span>
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-400 text-center mt-3">
              Ulasan ini soal pengalaman menggunakan SEAPEDIA — bisa dikirim tanpa checkout atau login.
            </p>
          </div>
        </div>
      </section>

      {/* ── SELLER CTA ── */}
      <section className="bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 py-16 px-4 text-white">
        <div className="container mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-xs font-semibold mb-4">
              <Store className="w-3 h-3" /> UNTUK PENJUAL
            </div>
            <h2 className="text-3xl font-bold mb-3">Mulai Berjualan<br />di SEAPEDIA, Gratis!</h2>
            <p className="text-blue-100 mb-6 max-w-sm text-sm leading-relaxed">
              Bergabung dengan 2.000+ penjual sukses. Nikmati buka toko gratis, laporan real-time, dan jangkau lebih dari 50.000 pembeli aktif.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/register">
                <Button className="bg-white text-primary hover:bg-blue-50 font-bold shadow-lg">
                  <Store className="w-4 h-4 mr-1.5" /> Daftar sebagai Penjual
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20">
                  Pelajari Lebih <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          {/* stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '2.000+', label: 'Seller Aktif' },
              { value: 'Rp 5M+', label: 'Total Transaksi' },
              { value: '0%',     label: 'Biaya Daftar' },
              { value: '24/7',   label: 'Support' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-yellow-300">{value}</p>
                <p className="text-sm text-blue-100 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="container mx-auto grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">SEAPEDIA</span>
            </div>
            <p className="text-sm leading-relaxed">Marketplace terpercaya untuk semua. Ribuan produk dari seller pilihan, pengiriman cepat ke seluruh Indonesia.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Navigasi</p>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block hover:text-white transition-colors">Beranda</Link>
              <Link href="/products" className="block hover:text-white transition-colors">Produk</Link>
              <Link href="/reviews" className="block hover:text-white transition-colors">Ulasan</Link>
            </div>
          </div>
          <div>
            <p className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Akun</p>
            <div className="space-y-2 text-sm">
              <Link href="/login" className="block hover:text-white transition-colors">Masuk</Link>
              <Link href="/register" className="block hover:text-white transition-colors">Daftar Akun</Link>
              <Link href="/dashboard/buyer" className="block hover:text-white transition-colors">Dashboard Buyer</Link>
              <Link href="/dashboard/seller" className="block hover:text-white transition-colors">Dashboard Seller</Link>
            </div>
          </div>
          <div>
            <p className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Bantuan</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Transaksi Terenkripsi</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Data Terlindungi</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-green-400" /> Penjual Terverifikasi</div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-xs">
          © 2026 SEAPEDIA — COMPFEST 18 Fasilkom UI.
        </div>
      </footer>
    </div>
  );
}
