'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Store, CheckCircle, XCircle } from 'lucide-react';

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

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchStores = () => {
    api.get('/admin/stores').then(r => setStores(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStores(); }, []);

  const handleToggleVerify = async (storeId: string, currentVerified: boolean) => {
    setTogglingId(storeId);
    try {
      await api.put(`/admin/stores/${storeId}/verify`, { isVerified: !currentVerified });
      toast.success(`Toko berhasil ${!currentVerified ? 'diverifikasi' : 'dibatalkan verifikasinya'}`);
      setStores(prev => prev.map(s => s.id === storeId ? { ...s, isVerified: !currentVerified } : s));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status verifikasi');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Manajemen Toko</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{stores.length} toko terdaftar</p>
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
                background: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store style={{ width: 16, height: 16, color: '#059669' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Semua Toko ({stores.length})
            </p>
          </div>

          {stores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8', fontSize: 14 }}>
              Belum ada toko
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Nama Toko', 'Seller', 'Email', 'Produk', 'Verified', 'Terdaftar', 'Aksi'].map(h => (
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
                  {stores.map(s => (
                    <tr
                      key={s.id}
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
                              background: '#F0FDF4',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Store style={{ width: 16, height: 16, color: '#059669' }} />
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{s.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{s.user?.username}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{s.user?.email}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{s._count?.products ?? 0}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {s.isVerified ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle style={{ width: 16, height: 16, color: '#059669' }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Terverifikasi</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <XCircle style={{ width: 16, height: 16, color: '#94A3B8' }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>Belum</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                          {new Date(s.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                        </p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => handleToggleVerify(s.id, s.isVerified)}
                          disabled={togglingId === s.id}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            border: 'none',
                            background: s.isVerified ? '#FEF2F2' : '#F0FDF4',
                            color: s.isVerified ? '#DC2626' : '#059669',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: togglingId === s.id ? 'not-allowed' : 'pointer',
                            opacity: togglingId === s.id ? 0.6 : 1,
                          }}
                        >
                          {togglingId === s.id
                            ? '...'
                            : s.isVerified
                            ? 'Batalkan'
                            : 'Verifikasi'}
                        </button>
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
