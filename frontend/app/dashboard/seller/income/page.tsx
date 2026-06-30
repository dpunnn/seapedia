'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/seller', label: 'Dashboard' },
  { href: '/dashboard/seller/store', label: 'Toko Saya' },
  { href: '/dashboard/seller/products', label: 'Produk' },
  { href: '/dashboard/seller/orders', label: 'Pesanan' },
  { href: '/dashboard/seller/income', label: 'Pendapatan' },
];

export default function SellerIncomePage() {
  const [income, setIncome] = useState<any>(null);
  useEffect(() => { api.get('/seller/income').then(r => setIncome(r.data.data)); }, []);

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Laporan Pendapatan</h1>
      {income && (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Total Pendapatan</p>
                <p className="text-2xl font-bold text-green-600">{formatRupiah(income.totalIncome)}</p>
                <p className="text-xs text-gray-400 mt-1">Setelah ongkir dikurangi</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Pesanan Selesai</p>
                <p className="text-2xl font-bold">{income.orderCount}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Detail Transaksi</CardTitle></CardHeader>
            <CardContent>
              {income.orders.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada pendapatan</p>
              ) : (
                <div className="space-y-2">
                  {income.orders.map((o: any) => (
                    <div key={o.id || Math.random()} className="flex justify-between text-sm py-1 border-b last:border-0">
                      <p className="text-gray-500">{new Date(o.createdAt).toLocaleDateString('id-ID')}</p>
                      <p className="font-medium text-green-600">{formatRupiah(o.totalAmount - o.deliveryFee)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
