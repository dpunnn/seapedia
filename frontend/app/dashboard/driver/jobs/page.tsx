'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import { Package, RefreshCw, Search } from 'lucide-react';

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
  const [hasActiveJob, setHasActiveJob] = useState(false);

  const fetchJobs = () => {
    setLoading(true);
    Promise.all([
      api.get('/driver/jobs'),
      api.get('/driver/jobs/active').catch(() => ({ data: { data: null } })),
    ]).then(([jobsRes, activeRes]) => {
      setJobs(jobsRes.data.data);
      setHasActiveJob(!!activeRes.data.data);
    }).finally(() => setLoading(false));
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
    <DashboardLayout role="DRIVER" navItems={NAV} navBadges={{ '/dashboard/driver/jobs': jobs.length }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Cari Job</h1>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>
            {jobs.length} job tersedia
            {jobs.length > 0 && (
              <span
                style={{
                  background: '#059669',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 20,
                  marginLeft: 8,
                }}
              >
                {jobs.length}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchJobs}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 10,
            border: '1.5px solid #E2E8F0',
            background: '#fff',
            fontSize: 13,
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          <RefreshCw style={{ width: 14, height: 14 }} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 14 }}>Memuat...</div>
      ) : jobs.length === 0 ? (
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
            <Search style={{ width: 24, height: 24, color: '#CBD5E1' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B', margin: 0 }}>Tidak ada job tersedia saat ini</p>
          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>Coba refresh beberapa saat lagi</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: 18,
          }}
        >
          {jobs.map(job => (
            <div
              key={job.id}
              style={{
                background: '#fff',
                borderRadius: 20,
                border: '1.5px solid #F1F5F9',
                padding: 22,
              }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  #{job.orderId.slice(-8).toUpperCase()}
                </p>
                <span
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                  }}
                >
                  {DELIVERY_LABELS[job.order?.deliveryMethod] ?? job.order?.deliveryMethod}
                </span>
              </div>

              {/* Store info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
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
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{job.order?.store?.name}</p>
                  <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                    {job.order?.items?.length ?? 0} item
                    {' · '}
                    {formatRupiah(job.order?.subtotal ?? 0)}
                  </p>
                </div>
              </div>

              {/* Fee section */}
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>Fee Pengantaran</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#059669', margin: 0 }}>
                  {formatRupiah(Number(job.order?.deliveryFee) * 0.8)}
                </p>
              </div>

              {/* Take button */}
              <button
                onClick={() => !hasActiveJob && handleTake(job.orderId)}
                disabled={hasActiveJob || taking === job.orderId}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 12,
                  border: 'none',
                  background: hasActiveJob || taking === job.orderId
                    ? '#E2E8F0'
                    : 'linear-gradient(135deg,#059669,#10B981)',
                  color: hasActiveJob || taking === job.orderId ? '#94A3B8' : '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: hasActiveJob || taking === job.orderId ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                {taking === job.orderId
                  ? 'Mengambil...'
                  : hasActiveJob
                  ? 'Sudah Ada Job Aktif'
                  : 'Ambil Job'}
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
