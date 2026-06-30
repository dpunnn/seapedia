'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stores').then(r => setStores(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Manajemen Toko</h1>

      {loading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Semua Toko ({stores.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4">Nama Toko</th>
                    <th className="pb-2 pr-4">Seller</th>
                    <th className="pb-2 pr-4">Email</th>
                    <th className="pb-2 pr-4">Produk</th>
                    <th className="pb-2">Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(s => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium">{s.name}</td>
                      <td className="py-2 pr-4">{s.user?.username}</td>
                      <td className="py-2 pr-4 text-gray-500">{s.user?.email}</td>
                      <td className="py-2 pr-4">{s._count?.products ?? 0}</td>
                      <td className="py-2 text-gray-400">
                        {new Date(s.createdAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stores.length === 0 && (
                <p className="text-center py-8 text-gray-400">Belum ada toko</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
