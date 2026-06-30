'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/driver', label: 'Dashboard' },
  { href: '/dashboard/driver/jobs', label: 'Cari Job' },
  { href: '/dashboard/driver/active', label: 'Job Aktif' },
  { href: '/dashboard/driver/history', label: 'Riwayat' },
];

const DELIVERY_LABELS: Record<string, string> = {
  INSTANT: 'Instan', NEXT_DAY: 'Besok', REGULAR: 'Reguler',
};

export default function DriverJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState<string | null>(null);

  const fetchJobs = () => {
    setLoading(true);
    api.get('/driver/jobs').then(r => setJobs(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleTake = async (orderId: string) => {
    setTaking(orderId);
    try {
      await api.post(`/driver/jobs/${orderId}/take`);
      toast.success('Job berhasil diambil!');
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengambil job');
    } finally {
      setTaking(null);
    }
  };

  return (
    <DashboardLayout role="DRIVER" navItems={NAV}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Job Tersedia</h1>
        <Button variant="outline" size="sm" onClick={fetchJobs}>Refresh</Button>
      </div>

      {loading ? <p className="text-gray-500">Memuat...</p> : jobs.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Tidak ada job tersedia saat ini</p>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <Card key={job.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">Pesanan #{job.orderId.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Dari: {job.order.store.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ke: {job.order.address.city}, {job.order.address.province}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.order.items.map((i: any) => `${i.productName} ×${i.quantity}`).join(', ')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{DELIVERY_LABELS[job.order.deliveryMethod]}</Badge>
                      <span className="text-green-600 font-bold text-sm">
                        {formatRupiah(Number(job.order.deliveryFee) * 0.8)} (80%)
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleTake(job.orderId)}
                    disabled={taking === job.orderId}
                  >
                    {taking === job.orderId ? 'Mengambil...' : 'Ambil'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
