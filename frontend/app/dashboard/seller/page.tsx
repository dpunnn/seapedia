'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/seller', label: 'Dashboard' },
  { href: '/dashboard/seller/store', label: 'Toko Saya' },
  { href: '/dashboard/seller/products', label: 'Produk' },
  { href: '/dashboard/seller/orders', label: 'Pesanan' },
  { href: '/dashboard/seller/income', label: 'Pendapatan' },
];

const STATUS_COLORS: Record<string, string> = {
  SEDANG_DIKEMAS: 'bg-yellow-100 text-yellow-700',
  MENUNGGU_PENGIRIM: 'bg-blue-100 text-blue-700',
  SEDANG_DIKIRIM: 'bg-orange-100 text-orange-700',
  PESANAN_SELESAI: 'bg-green-100 text-green-700',
  DIKEMBALIKAN: 'bg-red-100 text-red-700',
};

export default function SellerDashboard() {
  const [store, setStore] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [income, setIncome] = useState<any>(null);

  useEffect(() => {
    api.get('/seller/store').then(r => setStore(r.data.data)).catch(() => {});
    api.get('/seller/orders?limit=5').then(r => setOrders(r.data.data.orders || [])).catch(() => {});
    api.get('/seller/income').then(r => setIncome(r.data.data)).catch(() => {});
  }, []);

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Seller Dashboard</h1>

      {!store ? (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-3">Anda belum memiliki toko</p>
            <Link href="/dashboard/seller/store" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-9 px-4 text-sm font-medium">Buat Toko Sekarang</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Toko</p>
              <p className="font-bold">{store.name}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Produk</p>
              <p className="text-2xl font-bold">{store._count?.products ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Pendapatan</p>
              <p className="text-xl font-bold text-green-600">{income ? formatRupiah(income.totalIncome) : '-'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Pesanan Terbaru</CardTitle></CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada pesanan</p>
          ) : (
            <div className="space-y-2">
              {orders.map(o => (
                <div key={o.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{o.buyer?.username} · {formatRupiah(o.totalAmount)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link href="/dashboard/seller/orders" className="mt-3 w-full inline-flex items-center justify-center rounded-md border h-8 px-3 text-sm font-medium hover:bg-gray-50">Lihat Semua Pesanan</Link>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
