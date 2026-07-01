'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import { ShoppingCart } from 'lucide-react';

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

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  SEDANG_DIKEMAS:     { label: 'Dikemas',          bg: '#EFF6FF', color: '#2563EB' },
  MENUNGGU_PENGIRIM:  { label: 'Menunggu Driver',   bg: '#FFFBEB', color: '#D97706' },
  SEDANG_DIKIRIM:     { label: 'Dikirim',           bg: '#F5F3FF', color: '#7C3AED' },
  PESANAN_SELESAI:    { label: 'Selesai',           bg: '#F0FDF4', color: '#059669' },
  DIKEMBALIKAN:       { label: 'Dikembalikan',      bg: '#FEF2F2', color: '#DC2626' },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = status !== 'all' ? `?status=${status}` : '';
    api.get(`/admin/orders${params}`)
      .then(r => setOrders(r.data.data?.orders || []))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Semua Pesanan</h1>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{orders.length} pesanan ditemukan</p>
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v ?? 'all')}>
          <SelectTrigger style={{ width: 200, borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 13 }}>
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {Object.entries(STATUS_MAP).map(([v, s]) => (
              <SelectItem key={v} value={v}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <ShoppingCart style={{ width: 16, height: 16, color: '#3B82F6' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Daftar Pesanan ({orders.length})
            </p>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8', fontSize: 14 }}>
              Tidak ada pesanan
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Kode', 'Pembeli', 'Toko', 'Total', 'Status', 'Tanggal'].map(h => (
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
                  {orders.map(o => {
                    const st = STATUS_MAP[o.status];
                    return (
                      <tr
                        key={o.id}
                        style={{ borderBottom: '1px solid #F8FAFC' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', fontFamily: 'monospace', margin: 0 }}>
                            #{o.id.slice(-8).toUpperCase()}
                          </p>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{o.buyer?.username}</p>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{o.store?.name}</p>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            {formatRupiah(o.totalAmount)}
                          </p>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span
                            style={{
                              background: st?.bg ?? '#F1F5F9',
                              color: st?.color ?? '#475569',
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: 20,
                            }}
                          >
                            {st?.label ?? o.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
                            {new Date(o.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
