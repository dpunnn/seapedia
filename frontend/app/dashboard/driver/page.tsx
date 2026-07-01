'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/auth';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Truck, Search, History, TrendingUp, Package } from 'lucide-react';

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

  const totalJobs = history?.jobs?.length ?? 0;
  const totalEarning = history?.totalEarnings ?? 0;
  const avgEarning = totalJobs > 0 ? totalEarning / totalJobs : 0;

  return (
    <DashboardLayout role="DRIVER" navItems={NAV}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Driver Dashboard</h1>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Selamat datang kembali</p>
        </div>
        {/* Earning summary card */}
        <div
          style={{
            background: 'linear-gradient(135deg,#059669,#10B981)',
            borderRadius: 16,
            padding: '16px 22px',
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(5,150,105,0.3)',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Earning</p>
          <p style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginTop: 4 }}>
            {formatRupiah(totalEarning)}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 24 }}>
        {[
          { label: 'Total Pengiriman', value: totalJobs, icon: Truck, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Total Penghasilan', value: formatRupiah(totalEarning), icon: TrendingUp, color: '#059669', bg: '#F0FDF4' },
          { label: 'Rata-rata per Job', value: formatRupiah(avgEarning), icon: Package, color: '#7C3AED', bg: '#F5F3FF' },
        ].map(s => (
          <div
            key={s.label}
            style={{
              background: '#fff',
              borderRadius: 18,
              border: '1.5px solid #F1F5F9',
              padding: '20px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: s.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <s.icon style={{ width: 20, height: 20, color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active job or CTA */}
      {activeJob ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 22,
            border: '1.5px solid #F1F5F9',
            padding: 24,
            maxWidth: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
              #{activeJob.orderId.slice(-8).toUpperCase()}
            </p>
            <span
              style={{
                background: '#F5F3FF',
                color: '#7C3AED',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
              }}
            >
              Sedang Dikirim
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Package style={{ width: 20, height: 20, color: '#64748B' }} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{activeJob.order?.store?.name}</p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Tujuan: {activeJob.order?.address?.city}</p>
            </div>
          </div>

          <div
            style={{
              background: '#F0FDF4',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Estimasi Penghasilan</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#059669', marginTop: 4 }}>
              {formatRupiah(Number(activeJob.order?.deliveryFee) * 0.8)}
            </p>
          </div>

          <button
            onClick={() => handleComplete(activeJob.orderId)}
            disabled={completing}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              border: 'none',
              background: completing ? '#94A3B8' : 'linear-gradient(135deg,#059669,#10B981)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              cursor: completing ? 'not-allowed' : 'pointer',
            }}
          >
            {completing ? 'Memproses...' : 'Konfirmasi Pengiriman Selesai'}
          </button>
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 22,
            border: '1.5px solid #F1F5F9',
            padding: '40px 24px',
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Search style={{ width: 24, height: 24, color: '#CBD5E1' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>Tidak ada job aktif</p>
          <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>Cari job pengiriman yang tersedia</p>
          <Link
            href="/dashboard/driver/jobs"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              borderRadius: 10,
              background: 'linear-gradient(135deg,#059669,#10B981)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Cari Job Baru
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
