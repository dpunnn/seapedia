'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [days, setDays] = useState(1);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data.data));
  }, []);

  const handleAdvanceTime = async () => {
    setAdvancing(true);
    try {
      const res = await api.post('/admin/time/advance', { days });
      toast.success(`Waktu maju ${days} hari. Overdue diproses: ${res.data.data.overdueProcessed}`);
      api.get('/admin/stats').then(r => setStats(r.data.data));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal');
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Users', value: stats.users },
            { label: 'Toko', value: stats.stores },
            { label: 'Produk', value: stats.products },
            { label: 'Voucher', value: stats.vouchers },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="max-w-sm">
        <CardHeader><CardTitle className="text-base">Simulasi Waktu</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">Virtual date: {stats?.virtualDate ? new Date(stats.virtualDate).toLocaleDateString('id-ID') : '-'}</p>
          <div className="flex gap-2">
            <Input type="number" min={1} max={30} value={days} onChange={e => setDays(+e.target.value)} className="w-24" />
            <Button onClick={handleAdvanceTime} disabled={advancing} size="sm">
              {advancing ? 'Proses...' : `Maju ${days} Hari`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
