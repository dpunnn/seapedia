'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/admin', label: 'Dashboard' },
  { href: '/dashboard/admin/orders', label: 'Pesanan' },
  { href: '/dashboard/admin/orders/overdue', label: 'Overdue' },
  { href: '/dashboard/admin/users', label: 'Pengguna' },
  { href: '/dashboard/admin/stores', label: 'Toko' },
  { href: '/dashboard/admin/products', label: 'Produk' },
  { href: '/dashboard/admin/deliveries', label: 'Pengiriman' },
  { href: '/dashboard/admin/vouchers', label: 'Voucher' },
  { href: '/dashboard/admin/promos', label: 'Promo' },
  { href: '/dashboard/admin/time', label: 'Simulasi Waktu' },
];

const SLA_MAP: Record<string, number> = { INSTANT: 1, NEXT_DAY: 2, REGULAR: 5 };

export default function AdminOverduePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/orders/overdue').then(r => setOrders(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pesanan Overdue</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pesanan yang melebihi SLA pengiriman dan belum diproses auto-refund.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            Tidak ada pesanan overdue saat ini
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              {orders.length} pesanan overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Order ID</th>
                    <th className="pb-2 pr-4">Pembeli</th>
                    <th className="pb-2 pr-4">Toko</th>
                    <th className="pb-2 pr-4">Metode Kirim</th>
                    <th className="pb-2 pr-4">SLA</th>
                    <th className="pb-2 pr-4">Total</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b hover:bg-red-50">
                      <td className="py-2 pr-4 font-mono text-xs text-gray-500">
                        #{o.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-2 pr-4">{o.buyer?.username}</td>
                      <td className="py-2 pr-4">{o.store?.name}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline">{o.deliveryMethod}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-red-600 font-medium">
                        {SLA_MAP[o.deliveryMethod]} hari
                      </td>
                      <td className="py-2 pr-4">{formatRupiah(o.totalAmount)}</td>
                      <td className="py-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                          Overdue
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Gunakan Simulasi Waktu untuk meng-advance virtual date dan memicu auto-refund pesanan overdue.
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
