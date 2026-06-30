'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  SEDANG_DIKEMAS: { label: 'Dikemas', color: 'bg-yellow-100 text-yellow-700' },
  MENUNGGU_PENGIRIM: { label: 'Menunggu Driver', color: 'bg-blue-100 text-blue-700' },
  SEDANG_DIKIRIM: { label: 'Dikirim', color: 'bg-orange-100 text-orange-700' },
  PESANAN_SELESAI: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  DIKEMBALIKAN: { label: 'Dikembalikan', color: 'bg-red-100 text-red-700' },
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = status !== 'all' ? `?status=${status}` : '';
    api.get(`/buyer/orders${params}`).then(r => setOrders(r.data.data.orders || [])).finally(() => setLoading(false));
  }, [status]);

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pesanan Saya</h1>
        <Select value={status} onValueChange={v => setStatus(v ?? 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {Object.entries(STATUS_MAP).map(([v, s]) => (
              <SelectItem key={v} value={v}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Tidak ada pesanan</p>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const info = STATUS_MAP[o.status];
            return (
              <Link key={o.id} href={`/dashboard/buyer/orders/${o.id}`}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">#{o.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{o.store?.name} · {new Date(o.createdAt).toLocaleDateString('id-ID')}</p>
                      <p className="text-blue-600 font-bold text-sm mt-1">{formatRupiah(o.totalAmount)}</p>
                    </div>
                    {info && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${info.color}`}>{info.label}</span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
