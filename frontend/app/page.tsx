'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Belanja Lebih Mudah di SEAPEDIA</h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Ribuan produk dari penjual terpercaya. Pengiriman cepat, harga bersaing.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/products" className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground h-11 px-6 text-base font-medium">Lihat Produk</Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-md border border-white text-white h-11 px-6 text-base font-medium hover:bg-white/10">Daftar Sekarang</Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Produk Terbaru</h2>
          <Link href="/products" className="text-blue-600 hover:underline text-sm">Lihat semua →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-4xl">
                      📦
                    </div>
                    <p className="font-medium text-sm line-clamp-2">{p.name}</p>
                    <p className="text-blue-600 font-bold text-sm">{formatRupiah(p.price)}</p>
                    <p className="text-xs text-gray-500">{p.store?.name}</p>
                    <Badge variant="secondary" className="text-xs w-fit">Stok: {p.stock}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      <section className="bg-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Ulasan Pengguna</h2>
            <Link href="/reviews" className="text-blue-600 hover:underline text-sm">Lihat semua →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <span key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 italic">&ldquo;{r.comment}&rdquo;</p>
                  <p className="text-sm font-medium text-gray-800">— {r.reviewerName}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-50 py-12 px-4 text-center">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-3">Bergabung Sebagai Penjual</h2>
          <p className="text-gray-600 mb-6">Buka toko online Anda dan jangkau jutaan pembeli</p>
          <Link href="/register" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-11 px-6 text-base font-medium">Mulai Berjualan</Link>
        </div>
      </section>
    </div>
  );
}
