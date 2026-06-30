'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/driver', label: 'Dashboard' },
  { href: '/dashboard/driver/jobs', label: 'Cari Job' },
  { href: '/dashboard/driver/active', label: 'Job Aktif' },
  { href: '/dashboard/driver/history', label: 'Riwayat' },
];

export default function DriverActiveJobPage() {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchJob = () => {
    setLoading(true);
    api.get('/driver/jobs/active').then(r => setJob(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJob(); }, []);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await api.post(`/driver/jobs/${job.orderId}/complete`);
      toast.success(`Pengiriman selesai! Penghasilan: ${formatRupiah(res.data.data.earnings)}`);
      setJob(null);
      fetchJob();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <DashboardLayout role="DRIVER" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Job Aktif</h1>

      {loading ? <p className="text-gray-500">Memuat...</p> : !job ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Tidak ada job aktif saat ini</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-lg border-orange-200">
          <CardHeader><CardTitle className="text-base text-orange-700">Sedang Mengantarkan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm"><span className="text-gray-500">Pesanan:</span> #{job.orderId.slice(-8).toUpperCase()}</p>
            <p className="text-sm"><span className="text-gray-500">Dari:</span> {job.order.store.name}</p>
            <p className="text-sm"><span className="text-gray-500">Tujuan:</span> {job.order.address.fullAddress}, {job.order.address.city}</p>
            <p className="text-sm"><span className="text-gray-500">Penerima:</span> {job.order.buyer.username}</p>
            <p className="text-sm font-medium text-green-600">
              Estimasi Penghasilan: {formatRupiah(Number(job.order.deliveryFee) * 0.8)}
            </p>
            <div className="pt-2">
              <p className="text-xs text-gray-500 mb-2">Item:</p>
              {job.order.items.map((i: any) => (
                <p key={i.id} className="text-xs text-gray-600">• {i.productName} ×{i.quantity}</p>
              ))}
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleComplete} disabled={completing}>
              {completing ? 'Memproses...' : 'Konfirmasi Pengiriman Selesai'}
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
