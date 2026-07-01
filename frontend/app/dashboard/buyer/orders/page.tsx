'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import { ArrowRight, Package } from 'lucide-react';

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

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = status !== 'all' ? `?status=${status}` : '';
    api.get(`/buyer/orders${params}`)
      .then(r => setOrders(r.data.data.orders || []))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Pesanan Saya</h1>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Pantau status pesanan Anda</p>
        </div>
        <Select value={status} onValueChange={v => setStatus(v ?? 'all')}>
          <SelectTrigger
            style={{
              width: 180,
              border: '1.5px solid #E2E8F0',
              borderRadius: 12,
              background: '#fff',
            }}
          >
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
        <p style={{ color: '#94A3B8' }}>Memuat pesanan...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: '#CBD5E1' }} />
          <p style={{ color: '#64748B' }}>Tidak ada pesanan</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                    background: '#fff',
                    borderRadius: 16,
                    border: '1.5px solid #F1F5F9',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'box-shadow 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* Order icon */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Package className="w-5 h-5" style={{ color: '#1D4ED8' }} />
                    </div>

                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 2 }}>
                        #{o.id.slice(-8).toUpperCase()}
                      </p>
                      <p style={{ fontSize: 12, color: '#94A3B8' }}>
                        {o.store?.name ?? '-'} &middot;{' '}
                        {new Date(o.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', marginTop: 4 }}>
                        {formatRupiah(o.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {info ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '4px 12px',
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
                    <ArrowRight className="w-4 h-4" style={{ color: '#CBD5E1' }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
