'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { Users } from 'lucide-react';

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

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  BUYER:  { bg: '#EFF6FF', color: '#2563EB' },
  SELLER: { bg: '#F0FDF4', color: '#059669' },
  DRIVER: { bg: '#FFF7ED', color: '#EA580C' },
  ADMIN:  { bg: '#FEF2F2', color: '#DC2626' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.data?.users || [])).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Pengguna</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{users.length} pengguna terdaftar</p>
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
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users style={{ width: 16, height: 16, color: '#3B82F6' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Semua Pengguna ({users.length})
            </p>
          </div>

          {users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8', fontSize: 14 }}>
              Belum ada pengguna
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Pengguna', 'Email', 'Role', 'Bergabung'].map(h => (
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
                  {users.map(u => (
                    <tr
                      key={u.id}
                      style={{ borderBottom: '1px solid #F8FAFC' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
                              {u.username?.[0]?.toUpperCase() ?? 'U'}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{u.username}</p>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{u.email}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {u.roles.map((r: any) => {
                            const style = ROLE_STYLE[r.role] ?? { bg: '#F1F5F9', color: '#475569' };
                            return (
                              <span
                                key={r.role}
                                style={{
                                  background: style.bg,
                                  color: style.color,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: '3px 10px',
                                  borderRadius: 20,
                                }}
                              >
                                {r.role}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                          {new Date(u.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
