'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/auth';
import { toast } from 'sonner';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/driver', label: 'Dashboard' },
  { href: '/dashboard/driver/jobs', label: 'Cari Job' },
  { href: '/dashboard/driver/active', label: 'Job Aktif' },
  { href: '/dashboard/driver/history', label: 'Riwayat' },
];

export default function DriverDashboard() {
  const [activeJob, setActiveJob] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    api.get('/driver/jobs/active').then(r => setActiveJob(r.data.data)).catch(() => {});
    api.get('/driver/jobs/history').then(r => setHistory(r.data.data)).catch(() => {});
  }, []);

  const handleComplete = async (orderId: string) => {
    setCompleting(true);
    try {
      const res = await api.post(`/driver/jobs/${orderId}/complete`);
      toast.success(`Pengiriman selesai! Penghasilan: ${formatRupiah(res.data.data.earnings)}`);
      setActiveJob(null);
      api.get('/driver/jobs/history').then(r => setHistory(r.data.data));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <DashboardLayout role="DRIVER" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Driver Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 mb-1">Total Penghasilan</p>
            <p className="text-2xl font-bold text-green-600">
              {history ? formatRupiah(history.totalEarnings) : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 mb-1">Job Selesai</p>
            <p className="text-2xl font-bold">{history?.jobs?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {activeJob ? (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader><CardTitle className="text-base text-orange-700">Job Aktif</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm font-medium">#{activeJob.orderId.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-gray-600 mt-1">
              {activeJob.order?.store?.name} → {activeJob.order?.address?.city}
            </p>
            <p className="text-sm font-medium text-green-600 mt-1">
              Estimasi: {formatRupiah(Number(activeJob.order?.deliveryFee) * 0.8)}
            </p>
            <Button
              className="mt-3 bg-green-600 hover:bg-green-700"
              onClick={() => handleComplete(activeJob.orderId)}
              disabled={completing}
            >
              {completing ? 'Memproses...' : 'Konfirmasi Pengiriman Selesai'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-5 text-center">
            <p className="text-gray-500 mb-3">Tidak ada job aktif</p>
            <Link href="/dashboard/driver/jobs" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-9 px-4 text-sm font-medium">Cari Job Baru</Link>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
