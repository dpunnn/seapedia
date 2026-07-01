'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import { Package, Truck } from 'lucide-react';

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
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Job Aktif</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Pengiriman yang sedang berjalan</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 14 }}>Memuat...</div>
      ) : !job ? (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
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
            <Truck style={{ width: 24, height: 24, color: '#CBD5E1' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B', margin: 0 }}>Tidak ada job aktif saat ini</p>
          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>Ambil job dari halaman Cari Job</p>
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 22,
            border: '1.5px solid #F1F5F9',
            padding: 28,
            maxWidth: 600,
          }}
        >
          {/* Header kode + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              #{job.orderId.slice(-8).toUpperCase()}
            </p>
            <span
              style={{
                background: '#F5F3FF',
                color: '#7C3AED',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 20,
              }}
            >
              Sedang Dikirim
            </span>
          </div>

          {/* Store info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
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
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>{job.order?.store?.name}</p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                Tujuan: {job.order?.address?.fullAddress}, {job.order?.address?.city}
              </p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>
                Penerima: {job.order?.buyer?.username}
              </p>
            </div>
          </div>

          {/* Items list */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Item Pesanan
            </p>
            <div
              style={{
                border: '1px solid #F1F5F9',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {job.order?.items?.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: idx < job.order.items.length - 1 ? '1px solid #F1F5F9' : 'none',
                  }}
                >
                  <p style={{ fontSize: 13, color: '#0F172A', margin: 0 }}>{item.productName}</p>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>x{item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Earning box */}
          <div
            style={{
              background: '#F0FDF4',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Estimasi Penghasilan</p>
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>80% dari fee pengiriman</p>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#059669', margin: 0 }}>
              {formatRupiah(Number(job.order?.deliveryFee) * 0.8)}
            </p>
          </div>

          {/* Complete button */}
          <button
            onClick={handleComplete}
            disabled={completing}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: completing ? '#94A3B8' : 'linear-gradient(135deg,#059669,#10B981)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 800,
              cursor: completing ? 'not-allowed' : 'pointer',
              boxShadow: completing ? 'none' : '0 4px 16px rgba(5,150,105,0.3)',
            }}
          >
            {completing ? 'Memproses...' : 'Konfirmasi Pengiriman Selesai'}
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
