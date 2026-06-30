'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function PublicStorePage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/seller/stores/${id}`).then(r => setStore(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async (productId: string) => {
    if (!user || user.activeRole !== 'BUYER') {
      toast.error('Login sebagai Buyer untuk menambahkan ke keranjang');
      return;
    }
    setAdding(productId);
    try {
      await api.post('/buyer/cart/items', { productId, quantity: 1 });
      toast.success('Produk ditambahkan ke keranjang');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal');
    } finally {
      setAdding(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Memuat toko...</p>
    </div>
  );

  if (!store) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Toko tidak ditemukan</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/products" className="text-sm text-blue-600 hover:underline">← Kembali ke Produk</Link>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold">{store.name}</h1>
        {store.description && <p className="mt-2 opacity-90">{store.description}</p>}
        <p className="text-sm opacity-75 mt-2">{store._count?.products ?? 0} produk</p>
      </div>

      <h2 className="text-xl font-bold mb-4">Produk Toko</h2>
      {store.products.length === 0 ? (
        <p className="text-gray-500">Toko ini belum memiliki produk</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {store.products.map((p: any) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <Link href={`/products/${p.id}`}>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-4xl mb-2 hover:bg-gray-200">
                    📦
                  </div>
                  <p className="font-medium text-sm line-clamp-2">{p.name}</p>
                  <p className="text-blue-600 font-bold text-sm mt-1">{formatRupiah(p.price)}</p>
                  <p className="text-xs text-gray-400">Stok: {p.stock}</p>
                </Link>
                <Button
                  className="w-full mt-2" size="sm"
                  disabled={p.stock === 0 || adding === p.id}
                  onClick={() => handleAddToCart(p.id)}
                >
                  {p.stock === 0 ? 'Habis' : adding === p.id ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
