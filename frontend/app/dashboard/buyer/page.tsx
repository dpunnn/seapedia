'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import { ShoppingCart, Package, TrendingDown, ArrowRight } from 'lucide-react';

const NAV = [
  { href: '/dashboard/buyer', label: 'Dashboard' },
  { href: '/dashboard/buyer/wallet', label: 'Dompet' },
  { href: '/dashboard/buyer/cart', label: 'Keranjang' },
  { href: '/dashboard/buyer/addresses', label: 'Alamat' },
  { href: '/dashboard/buyer/orders', label: 'Pesanan Saya' },
  { href: '/dashboard/buyer/report', label: 'Laporan Belanja' },
];

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  SEDANG_DIKEMAS:    { label: 'Dikemas',         bg: '#FEF9C3', color: '#A16207' },
  MENUNGGU_PENGIRIM: { label: 'Menunggu Driver', bg: '#DBEAFE', color: '#1D4ED8' },
  SEDANG_DIKIRIM:    { label: 'Dikirim',         bg: '#EDE9FE', color: '#6D28D9' },
  PESANAN_SELESAI:   { label: 'Selesai',         bg: '#DCFCE7', color: '#15803D' },
  DIKEMBALIKAN:      { label: 'Dikembalikan',    bg: '#FEE2E2', color: '#DC2626' },
};

export default function BuyerDashboard() {
  const [wallet, setWallet] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get('/buyer/wallet').then(r => setWallet(r.data.data)).catch(() => {});
    api.get('/buyer/orders?limit=5').then(r => setOrders(r.data.data.orders || [])).catch(() => {});
  }, []);

  const totalOrders = orders.length;
  const activeOrders = orders.filter(o =>
    ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM'].includes(o.status)
  ).length;
  const totalSpent = orders
    .filter(o => o.status === 'PESANAN_SELESAI')
    .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Dashboard Pembeli
          </h1>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
            Selamat datang kembali! Berikut ringkasan aktivitas belanja Anda.
          </p>
        </div>

        {/* Saldo card */}
        <div
          style={{
            background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
            borderRadius: 18,
            padding: '18px 24px',
            minWidth: 220,
            color: '#fff',
          }}
        >
          <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Saldo Dompet</p>
          <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
            {wallet ? formatRupiah(wallet.balance) : '-'}
          </p>
          <Link
            href="/dashboard/buyer/wallet"
            style={{
              display: 'inline-block',
              marginTop: 12,
              background: '#fff',
              color: '#1D4ED8',
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 16px',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            Top Up
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div
        className="mb-8"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}
      >
        {[
          {
            icon: <ShoppingCart className="w-5 h-5" style={{ color: '#3B82F6' }} />,
            label: 'Total Pesanan',
            value: totalOrders,
            iconBg: '#EFF6FF',
          },
          {
            icon: <Package className="w-5 h-5" style={{ color: '#7C3AED' }} />,
            label: 'Pesanan Aktif',
            value: activeOrders,
            iconBg: '#F5F3FF',
          },
          {
            icon: <TrendingDown className="w-5 h-5" style={{ color: '#059669' }} />,
            label: 'Total Pengeluaran',
            value: formatRupiah(totalSpent),
            iconBg: '#ECFDF5',
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: 18,
              padding: 20,
              border: '1.5px solid #F1F5F9',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: s.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              {s.icon}
            </div>
            <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1.5px solid #F1F5F9' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Pesanan Terbaru</h2>
          <Link
            href="/dashboard/buyer/orders"
            style={{ fontSize: 13, color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}
          >
            Lihat Semua
          </Link>
        </div>

        {orders.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Belum ada pesanan</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                padding: '8px 12px',
                fontSize: 12,
                color: '#94A3B8',
                fontWeight: 600,
              }}
            >
              <span>ID Pesanan</span>
              <span>Toko</span>
              <span>Total</span>
              <span>Status</span>
              <span></span>
            </div>

            {orders.map(o => {
              const info = STATUS_MAP[o.status];
              return (
                <Link
                  key={o.id}
                  href={`/dashboard/buyer/orders/${o.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: 12,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                      #{o.id.slice(-8).toUpperCase()}
                    </span>
                    <span style={{ fontSize: 13, color: '#64748B' }}>{o.store?.name ?? '-'}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>
                      {formatRupiah(o.totalAmount)}
                    </span>
                    <span>
                      {info ? (
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 20,
                            background: info.bg,
                            color: info.color,
                          }}
                        >
                          {info.label}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{o.status}</span>
                      )}
                    </span>
                    <ArrowRight className="w-4 h-4" style={{ color: '#CBD5E1' }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
