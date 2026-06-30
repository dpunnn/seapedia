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
  { href: '/dashboard/buyer', label: 'Dashboard' },
  { href: '/dashboard/buyer/wallet', label: 'Dompet' },
  { href: '/dashboard/buyer/cart', label: 'Keranjang' },
  { href: '/dashboard/buyer/addresses', label: 'Alamat' },
  { href: '/dashboard/buyer/orders', label: 'Pesanan Saya' },
  { href: '/dashboard/buyer/report', label: 'Laporan Belanja' },
];

const STATUS_COLORS: Record<string, string> = {
  SEDANG_DIKEMAS: 'bg-yellow-100 text-yellow-700',
  MENUNGGU_PENGIRIM: 'bg-blue-100 text-blue-700',
  SEDANG_DIKIRIM: 'bg-orange-100 text-orange-700',
  PESANAN_SELESAI: 'bg-green-100 text-green-700',
  DIKEMBALIKAN: 'bg-red-100 text-red-700',
};

export default function BuyerDashboard() {
  const [wallet, setWallet] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get('/buyer/wallet').then(r => setWallet(r.data.data)).catch(() => {});
    api.get('/buyer/orders?limit=5').then(r => setOrders(r.data.data.orders || [])).catch(() => {});
  }, []);

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Dashboard Pembeli</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 mb-1">Saldo Dompet</p>
            <p className="text-2xl font-bold text-blue-600">
              {wallet ? formatRupiah(wallet.balance) : '-'}
            </p>
            <Link href="/dashboard/buyer/wallet" className="mt-3 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-8 px-3 text-sm font-medium">Top Up</Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 mb-1">Aksi Cepat</p>
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/products" className="inline-flex items-center justify-center rounded-md border h-8 px-3 text-sm font-medium hover:bg-gray-50">Belanja Sekarang</Link>
              <Link href="/dashboard/buyer/cart" className="inline-flex items-center justify-center rounded-md border h-8 px-3 text-sm font-medium hover:bg-gray-50">Keranjang Saya</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Pesanan Terbaru</CardTitle></CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada pesanan</p>
          ) : (
            <div className="space-y-2">
              {orders.map(o => (
                <Link key={o.id} href={`/dashboard/buyer/orders/${o.id}`}>
                  <div className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{o.store?.name} · {formatRupiah(o.totalAmount)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link href="/dashboard/buyer/orders" className="mt-3 w-full inline-flex items-center justify-center rounded-md border h-8 px-3 text-sm font-medium hover:bg-gray-50">Lihat Semua</Link>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
