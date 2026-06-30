'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/admin', label: 'Dashboard' },
  { href: '/dashboard/admin/orders', label: 'Pesanan' },
  { href: '/dashboard/admin/users', label: 'Pengguna' },
  { href: '/dashboard/admin/vouchers', label: 'Voucher' },
  { href: '/dashboard/admin/promos', label: 'Promo' },
  { href: '/dashboard/admin/time', label: 'Simulasi Waktu' },
];

const STATUS_MAP: Record<string, string> = {
  SEDANG_DIKEMAS: 'Dikemas',
  MENUNGGU_PENGIRIM: 'Menunggu Driver',
  SEDANG_DIKIRIM: 'Dikirim',
  PESANAN_SELESAI: 'Selesai',
  DIKEMBALIKAN: 'Dikembalikan',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = status !== 'all' ? `?status=${status}` : '';
    api.get(`/admin/orders${params}`).then(r => setOrders(r.data.data?.orders || [])).finally(() => setLoading(false));
  }, [status]);

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Semua Pesanan</h1>
        <Select value={status} onValueChange={(v) => setStatus(v ?? 'all')}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {Object.entries(STATUS_MAP).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? <p className="text-gray-500">Memuat...</p> : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Tidak ada pesanan</p>
      ) : (
        <div className="space-y-2">
          {orders.map(o => (
            <Card key={o.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">#{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">
                    {o.buyer?.username} · {o.store?.name} · {new Date(o.createdAt).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-sm font-bold text-blue-600 mt-1">{formatRupiah(o.totalAmount)}</p>
                </div>
                <Badge variant="secondary">{STATUS_MAP[o.status] || o.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
