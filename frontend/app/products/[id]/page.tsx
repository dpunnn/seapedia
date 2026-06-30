'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatRupiah } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(res => {
      setProduct(res.data.data);
    }).catch(() => {
      toast.error('Produk tidak ditemukan');
      router.push('/products');
    }).finally(() => setLoading(false));
  }, [id, router]);

  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return; }
    if (user.activeRole !== 'BUYER') {
      toast.error('Pilih peran Pembeli untuk menambahkan ke keranjang');
      return;
    }
    setAdding(true);
    try {
      await api.post('/buyer/cart/items', { productId: id, quantity });
      toast.success('Produk ditambahkan ke keranjang!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← Kembali ke produk
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-8xl">
          📦
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-3xl font-bold text-blue-600 mt-2">{formatRupiah(product.price)}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
              {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
            </Badge>
          </div>

          {product.description && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Deskripsi</p>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-3">
            <p className="text-sm font-medium">Toko:</p>
            <Link href={`/stores/${product.store?.id}`} className="text-blue-600 hover:underline text-sm">
              {product.store?.name}
            </Link>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <button
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >−</button>
                <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
                <button
                  className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                >+</button>
              </div>
              <Button onClick={handleAddToCart} disabled={adding} className="flex-1">
                {adding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
