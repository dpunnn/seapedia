'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBag, Star, Package, Users, Store, Truck, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

const STATS = [
  { icon: Package,     label: 'Produk Tersedia',   value: '1.000+' },
  { icon: Store,       label: 'Penjual Aktif',      value: '500+' },
  { icon: Truck,       label: 'Pengiriman Selesai', value: '10.000+' },
  { icon: ShieldCheck, label: 'Transaksi Aman',     value: '100%' },
];

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=8'),
      api.get('/reviews'),
    ]).then(([pRes, rRes]) => {
      setProducts(pRes.data.data.products);
      setReviews(rRes.data.data.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
            <ShoppingBag className="w-4 h-4" />
            Marketplace Terpercaya Indonesia
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
            Belanja Lebih Mudah<br className="hidden md:block" /> di{' '}
            <span className="text-yellow-300">SEAPEDIA</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
            Ribuan produk dari penjual terpercaya. Pengiriman cepat, harga bersaing, transaksi aman.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/products">
              <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold shadow-lg">
                Lihat Produk
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-white/50 text-white bg-white/10 hover:bg-white/20 font-semibold backdrop-blur-sm">
                Daftar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Produk Terbaru</h2>
            <p className="text-sm text-gray-500 mt-1">Temukan produk pilihan dari penjual terpercaya</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Lihat semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-60 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full hover:-translate-y-0.5 border-gray-100">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-50 rounded-t-xl overflow-hidden flex items-center justify-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-14 h-14 text-gray-300" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm line-clamp-2 text-gray-800">{p.name}</p>
                      <p className="text-primary font-bold text-sm mt-1">{formatRupiah(p.price)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.store?.name}</p>
                      <Badge variant="secondary" className="text-xs mt-2 w-fit">Stok: {p.stock}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kata Pengguna</h2>
              <p className="text-sm text-gray-500 mt-1">Pengalaman nyata dari pembeli kami</p>
            </div>
            <Link href="/reviews" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Semua ulasan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada ulasan.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {reviews.map((r) => (
                <Card key={r.id} className="border-gray-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 italic leading-relaxed mb-4">&ldquo;{r.comment}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{r.reviewerName?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{r.reviewerName}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Seller */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 px-4 text-center text-white">
        <div className="container mx-auto">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Mulai Berjualan di SEAPEDIA</h2>
          <p className="text-blue-100 mb-7 max-w-md mx-auto">
            Buka toko online Anda dan jangkau ribuan pembeli. Gratis, mudah, dan terpercaya.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold shadow-lg">
              Daftar Jadi Penjual
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-base">SEAPEDIA</span>
              </div>
              <p className="text-sm leading-relaxed">Marketplace terpercaya untuk semua kebutuhan Anda.</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Navigasi</p>
              <div className="space-y-2 text-sm">
                <Link href="/products" className="block hover:text-white transition-colors">Produk</Link>
                <Link href="/reviews" className="block hover:text-white transition-colors">Ulasan</Link>
                <Link href="/login" className="block hover:text-white transition-colors">Masuk</Link>
                <Link href="/register" className="block hover:text-white transition-colors">Daftar</Link>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Keamanan</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400" /> Transaksi Terenkripsi</div>
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400" /> Data Terlindungi</div>
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400" /> Penjual Terverifikasi</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs">
            © 2026 SEAPEDIA — COMPFEST 18 Fasilkom UI.
          </div>
        </div>
      </footer>
    </div>
  );
}
