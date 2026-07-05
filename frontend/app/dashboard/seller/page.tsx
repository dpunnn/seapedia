'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { formatRupiah } from '@/lib/auth';
import { DollarSign, Package, ShoppingCart, Clock } from 'lucide-react';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/seller', label: 'Dashboard' },
  { href: '/dashboard/seller/store', label: 'Toko Saya' },
  { href: '/dashboard/seller/products', label: 'Produk' },
  { href: '/dashboard/seller/orders', label: 'Pesanan' },
  { href: '/dashboard/seller/income', label: 'Pendapatan' },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  SEDANG_DIKEMAS:    { label: 'Sedang Dikemas',    color: '#F59E0B', bg: '#FFFBEB' },
  MENUNGGU_PENGIRIM: { label: 'Menunggu Pengirim', color: '#EA580C', bg: '#FFF7ED' },
  SEDANG_DIKIRIM:    { label: 'Sedang Dikirim',    color: '#7C3AED', bg: '#F5F3FF' },
  PESANAN_SELESAI:   { label: 'Pesanan Selesai',   color: '#16A34A', bg: '#F0FDF4' },
  DIKEMBALIKAN:      { label: 'Dikembalikan',      color: '#DC2626', bg: '#FEF2F2' },
};

export default function SellerDashboard() {
  const [store, setStore] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [income, setIncome] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/seller/store').then(r => setStore(r.data.data)).catch(() => {}),
      api.get('/seller/orders?limit=5').then(r => setOrders(r.data.data.orders || [])).catch(() => {}),
      api.get('/seller/income').then(r => setIncome(r.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const pendingCount = orders.filter(o => o.status === 'SEDANG_DIKEMAS').length;

  const statCards = [
    {
      label: 'Pendapatan (Selesai)',
      value: income ? formatRupiah(income.totalIncome) : '-',
      icon: DollarSign,
      iconBg: '#F0FDF4',
      iconColor: '#16A34A',
    },
    {
      label: 'Pesanan Masuk',
      value: String(orders.length),
      icon: ShoppingCart,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      label: 'Produk Aktif',
      value: String(store?._count?.products ?? 0),
      icon: Package,
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
    },
    {
      label: 'Perlu Diproses',
      value: String(pendingCount),
      icon: Clock,
      iconBg: '#FEF2F2',
      iconColor: '#DC2626',
      valueColor: '#DC2626',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout role="SELLER" navItems={NAV}>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      {/* Header */}
      <div className="mb-7">
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Dashboard Penjual</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>Pantau kinerja tokomu</p>
      </div>

      {!store && (
        <div style={{
          background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: 16,
          padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 13, color: '#92400E', fontWeight: 600, flex: 1 }}>
            Kamu belum punya toko. Buat profil toko di menu "Toko Saya" untuk mulai menjual produk.
          </div>
          <Link href="/dashboard/seller/store" style={{
            padding: '9px 16px', background: '#F59E0B', color: 'white', borderRadius: 9,
            fontSize: 12, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>Buat Toko</Link>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{
              background: 'white', borderRadius: 20, padding: 22,
              border: '1.5px solid #F1F5F9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                  {s.label}
                </span>
                <div style={{
                  width: 36, height: 36, background: s.iconBg, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={17} color={s.iconColor} />
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.valueColor || '#0F172A' }}>
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div style={{ background: 'white', borderRadius: 22, padding: 26, border: '1.5px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Pesanan Masuk Terbaru</div>
          <Link href="/dashboard/seller/orders" style={{
            fontSize: 12, color: '#2563EB', fontWeight: 700, textDecoration: 'none',
          }}>Lihat semua →</Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: 13 }}>
            Belum ada pesanan masuk
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                {['Pesanan', 'Pembeli', 'Total', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8',
                    textTransform: 'uppercase', paddingBottom: 10,
                    paddingRight: h !== 'Aksi' ? 12 : 0,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const info = STATUS_MAP[o.status];
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '14px 12px 14px 0', fontSize: 13, fontWeight: 600, color: '#2563EB' }}>
                      #{o.id.slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 12px 14px 0', fontSize: 13, color: '#64748B' }}>
                      {o.buyer?.username || '-'}
                    </td>
                    <td style={{ padding: '14px 12px 14px 0', fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                      {formatRupiah(o.totalAmount)}
                    </td>
                    <td style={{ padding: '14px 12px 14px 0' }}>
                      {info && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: info.color, background: info.bg,
                          padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap',
                        }}>{info.label}</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 0' }}>
                      {o.status === 'SEDANG_DIKEMAS' && (
                        <Link href="/dashboard/seller/orders" style={{
                          padding: '6px 14px', background: '#2563EB', color: 'white',
                          borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: 'none',
                        }}>Proses Pesanan</Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
