'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import { Truck } from 'lucide-react';

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

const JOB_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  AVAILABLE:  { label: 'Tersedia', bg: '#EFF6FF', color: '#2563EB' },
  TAKEN:      { label: 'Diambil',  bg: '#FFF7ED', color: '#EA580C' },
  COMPLETED:  { label: 'Selesai',  bg: '#F0FDF4', color: '#059669' },
};

export default function AdminDeliveriesPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/deliveries').then(r => setJobs(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Monitoring Pengiriman</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{jobs.length} delivery job</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 14 }}>Memuat...</div>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            border: '1.5px solid #F1F5F9',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#FFF7ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck style={{ width: 16, height: 16, color: '#EA580C' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Semua Delivery Jobs ({jobs.length})
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Order ID', 'Toko', 'Pembeli', 'Driver', 'Earnings', 'Status'].map(h => (
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
                {jobs.map(j => {
                  const s = JOB_STATUS[j.status];
                  return (
                    <tr
                      key={j.id}
                      style={{ borderBottom: '1px solid #F8FAFC' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', fontFamily: 'monospace', margin: 0 }}>
                          #{j.orderId.slice(-8).toUpperCase()}
                        </p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{j.order?.store?.name}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{j.order?.buyer?.username}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: j.driver ? '#0F172A' : '#CBD5E1', fontWeight: j.driver ? 600 : 400, margin: 0 }}>
                          {j.driver?.username ?? '-'}
                        </p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: j.earnings ? '#059669' : '#94A3B8', margin: 0 }}>
                          {j.earnings ? formatRupiah(j.earnings) : '-'}
                        </p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            background: s?.bg ?? '#F1F5F9',
                            color: s?.color ?? '#475569',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 20,
                          }}
                        >
                          {s?.label ?? j.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
                      Belum ada data pengiriman
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
