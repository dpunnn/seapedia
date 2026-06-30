'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/driver', label: 'Dashboard' },
  { href: '/dashboard/driver/jobs', label: 'Cari Job' },
  { href: '/dashboard/driver/active', label: 'Job Aktif' },
  { href: '/dashboard/driver/history', label: 'Riwayat' },
];

export default function DriverHistoryPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api.get('/driver/jobs/history').then(r => setData(r.data.data));
  }, []);

  return (
    <DashboardLayout role="DRIVER" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Riwayat Pengiriman</h1>
      {data && (
        <>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Total Penghasilan</p>
                <p className="text-2xl font-bold text-green-600">{formatRupiah(data.totalEarnings)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Total Pengiriman</p>
                <p className="text-2xl font-bold">{data.jobs.length}</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm">Riwayat Job</CardTitle></CardHeader>
            <CardContent>
              {data.jobs.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada riwayat pengiriman</p>
              ) : (
                <div className="space-y-2">
                  {data.jobs.map((j: any) => (
                    <div key={j.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">#{j.orderId.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">
                          {j.order.store.name} → {j.order.address.city}
                        </p>
                        <p className="text-xs text-gray-400">
                          {j.completedAt ? new Date(j.completedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                        </p>
                      </div>
                      <p className="font-bold text-green-600">{formatRupiah(j.earnings ?? 0)}</p>
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
