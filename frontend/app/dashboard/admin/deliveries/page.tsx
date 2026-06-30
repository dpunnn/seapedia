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

const JOB_STATUS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'Tersedia', color: 'bg-blue-100 text-blue-700' },
  TAKEN: { label: 'Diambil', color: 'bg-orange-100 text-orange-700' },
  COMPLETED: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
};

export default function AdminDeliveriesPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/deliveries').then(r => setJobs(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Monitoring Pengiriman</h1>

      {loading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Semua Delivery Jobs ({jobs.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Order ID</th>
                    <th className="pb-2 pr-4">Toko</th>
                    <th className="pb-2 pr-4">Pembeli</th>
                    <th className="pb-2 pr-4">Driver</th>
                    <th className="pb-2 pr-4">Earnings</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => {
                    const s = JOB_STATUS[j.status];
                    return (
                      <tr key={j.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 pr-4 font-mono text-xs text-gray-500">#{j.orderId.slice(-8).toUpperCase()}</td>
                        <td className="py-2 pr-4">{j.order?.store?.name}</td>
                        <td className="py-2 pr-4 text-gray-500">{j.order?.buyer?.username}</td>
                        <td className="py-2 pr-4">{j.driver?.username ?? <span className="text-gray-300">-</span>}</td>
                        <td className="py-2 pr-4">{j.earnings ? formatRupiah(j.earnings) : '-'}</td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s?.color}`}>
                            {s?.label ?? j.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {jobs.length === 0 && (
                <p className="text-center py-8 text-gray-400">Belum ada data pengiriman</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
