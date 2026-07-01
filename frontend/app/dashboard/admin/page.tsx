'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Users, Store, Package, Ticket, ShoppingCart, Truck, Clock } from 'lucide-react';

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

const STATS_CONFIG = [
  { key: 'users', label: 'Total Users', icon: Users, color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'stores', label: 'Total Toko', icon: Store, color: '#059669', bg: '#F0FDF4' },
  { key: 'products', label: 'Total Produk', icon: Package, color: '#7C3AED', bg: '#F5F3FF' },
  { key: 'vouchers', label: 'Total Voucher', icon: Ticket, color: '#F59E0B', bg: '#FFFBEB' },
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
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Monitoring & manajemen platform SEAPEDIA</p>
      </div>

      {/* Stats grid 4 */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 28 }}>
          {STATS_CONFIG.map(s => (
            <div
              key={s.key}
              style={{
                background: '#fff',
                borderRadius: 18,
                border: '1.5px solid #F1F5F9',
                padding: '20px 22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  {s.label}
                </p>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: s.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <s.icon style={{ width: 18, height: 18, color: s.color }} />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {stats[s.key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Simulasi Waktu */}
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          border: '1.5px solid #F1F5F9',
          padding: 24,
          maxWidth: 400,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#FFFBEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock style={{ width: 18, height: 18, color: '#F59E0B' }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>Simulasi Waktu</p>
            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>
              Virtual date: {stats?.virtualDate ? new Date(stats.virtualDate).toLocaleDateString('id-ID') : '-'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input
            type="number"
            min={1}
            max={30}
            value={days}
            onChange={e => setDays(+e.target.value)}
            style={{ width: 80 }}
          />
          <Button
            onClick={handleAdvanceTime}
            disabled={advancing}
            style={{
              background: advancing ? '#94A3B8' : 'linear-gradient(135deg,#F59E0B,#D97706)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {advancing ? 'Proses...' : `Maju ${days} Hari`}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
