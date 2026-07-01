'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import { Truck, TrendingUp, BarChart2, History } from 'lucide-react';

const NAV = [
  { href: '/dashboard/driver', label: 'Dashboard' },
  { href: '/dashboard/driver/jobs', label: 'Cari Job' },
  { href: '/dashboard/driver/active', label: 'Job Aktif' },
  { href: '/dashboard/driver/history', label: 'Riwayat' },
];

export default function DriverHistoryPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/driver/jobs/history')
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const totalJobs = data?.jobs?.length ?? 0;
  const totalEarning = data?.totalEarnings ?? 0;
  const avgEarning = totalJobs > 0 ? totalEarning / totalJobs : 0;

  return (
    <DashboardLayout role="DRIVER" navItems={NAV}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Riwayat Pengiriman</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Semua pengiriman yang sudah selesai</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 14 }}>Memuat...</div>
      ) : (
        <>
          {/* Stats grid 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 24 }}>
            {[
              { label: 'Total Job', value: String(totalJobs), icon: Truck, color: '#3B82F6', bg: '#EFF6FF' },
              { label: 'Total Earning', value: formatRupiah(totalEarning), icon: TrendingUp, color: '#059669', bg: '#F0FDF4' },
              { label: 'Rata-rata per Job', value: formatRupiah(avgEarning), icon: BarChart2, color: '#7C3AED', bg: '#F5F3FF' },
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

          {/* History table */}
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              border: '1.5px solid #F1F5F9',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>Riwayat Job</p>
            </div>

            {data?.jobs?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
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
                  <History style={{ width: 24, height: 24, color: '#CBD5E1' }} />
                </div>
                <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Belum ada riwayat pengiriman</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      {['Kode Pesanan', 'Toko', 'Tanggal', 'Earning'].map(h => (
                        <th
                          key={h}
                          style={{
                            padding: '12px 20px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#94A3B8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            borderBottom: '1px solid #F1F5F9',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.jobs?.map((j: any) => (
                      <tr
                        key={j.id}
                        style={{ borderBottom: '1px solid #F8FAFC' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            #{j.orderId.slice(-8).toUpperCase()}
                          </p>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{j.order?.store?.name}</p>
                          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{j.order?.address?.city}</p>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                            {j.completedAt
                              ? new Date(j.completedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                              : '-'}
                          </p>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontSize: 14, fontWeight: 800, color: '#059669', margin: 0 }}>
                            {formatRupiah(j.earnings ?? 0)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
