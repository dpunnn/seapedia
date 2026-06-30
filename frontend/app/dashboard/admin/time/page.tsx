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
  { href: '/dashboard/admin/users', label: 'Pengguna' },
  { href: '/dashboard/admin/vouchers', label: 'Voucher' },
  { href: '/dashboard/admin/promos', label: 'Promo' },
  { href: '/dashboard/admin/time', label: 'Simulasi Waktu' },
];

export default function AdminTimePage() {
  const [virtualTime, setVirtualTime] = useState<string | null>(null);
  const [days, setDays] = useState('1');
  const [advancing, setAdvancing] = useState(false);

  const fetchTime = () => {
    api.get('/admin/time').then(r => setVirtualTime(r.data.data.virtualDate));
  };

  useEffect(() => { fetchTime(); }, []);

  const handleAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdvancing(true);
    try {
      const res = await api.post('/admin/time/advance', { days: parseInt(days) });
      toast.success(`Waktu maju ${days} hari. Overdue diproses: ${res.data.data.overdueProcessed}`);
      setVirtualTime(res.data.data.newVirtualDate);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal');
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Simulasi Waktu</h1>

      <div className="max-w-md space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Waktu Virtual Saat Ini</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-blue-600">
              {virtualTime ? new Date(virtualTime).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) : 'Memuat...'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Digunakan untuk menentukan SLA overdue order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Majukan Waktu</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAdvance} className="space-y-3">
              <div className="space-y-1">
                <Label>Jumlah Hari</Label>
                <Input
                  type="number" min={1} max={365} value={days}
                  onChange={e => setDays(e.target.value)} required
                />
              </div>
              <p className="text-xs text-gray-500">
                Memajukan waktu akan memproses pesanan overdue secara otomatis berdasarkan SLA:
                INSTANT=1 hari, NEXT_DAY=2 hari, REGULAR=5 hari setelah SEDANG_DIKIRIM.
              </p>
              <Button type="submit" disabled={advancing} className="w-full">
                {advancing ? 'Memproses...' : `Maju ${days} Hari`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
