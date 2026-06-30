'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function SpendingReportPage() {
  const [report, setReport] = useState<any>(null);
  useEffect(() => {
    api.get('/buyer/report/spending').then(r => setReport(r.data.data));
  }, []);

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Laporan Belanja</h1>
      {report && (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Total Belanja</p>
                <p className="text-2xl font-bold text-blue-600">{formatRupiah(report.totalSpent)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Pesanan Selesai</p>
                <p className="text-2xl font-bold">{report.orderCount}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Riwayat Belanja</CardTitle></CardHeader>
            <CardContent>
              {report.orders.length === 0 ? (
                <p className="text-gray-500 text-sm">Belum ada belanja selesai</p>
              ) : (
                <div className="space-y-2">
                  {report.orders.map((o: any) => (
                    <div key={o.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                      <div>
                        <p className="font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                        <p className="text-gray-500 text-xs">{o.store?.name} · {new Date(o.createdAt).toLocaleDateString('id-ID')}</p>
                      </div>
                      <p className="font-bold text-blue-600">{formatRupiah(o.totalAmount)}</p>
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
