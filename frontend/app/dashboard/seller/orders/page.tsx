'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
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

const FILTER_OPTIONS = [
  { value: 'all', label: 'Semua Status' },
  ...Object.entries(STATUS_MAP).map(([v, s]) => ({ value: v, label: s.label })),
];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    const params = status !== 'all' ? `?status=${status}` : '';
    api.get(`/seller/orders${params}`)
      .then(r => setOrders(r.data.data.orders || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [status]);

  const handleProcess = async (id: string) => {
    try {
      await api.post(`/seller/orders/${id}/process`);
      toast.success('Pesanan diproses, menunggu driver');
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses');
    }
  };

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Pesanan Masuk</h1>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>Proses pesanan yang masuk</p>
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{
            padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 11,
            fontSize: 13, fontWeight: 600, color: '#374151', background: 'white',
            outline: 'none', cursor: 'pointer',
          }}
        >
          {FILTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 13 }}>Memuat...</div>
      ) : orders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 20px', background: 'white',
          borderRadius: 20, color: '#94A3B8', fontSize: 13, border: '1.5px solid #F1F5F9',
        }}>
          Belum ada pesanan masuk
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map(o => {
            const info = STATUS_MAP[o.status];
            return (
              <div key={o.id} style={{
                background: 'white', borderRadius: 20, padding: 22,
                border: '1.5px solid #F1F5F9',
              }}>
                {/* Order Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
                      #{o.id.slice(-8).toUpperCase()}
                    </span>
                    {info && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: info.color, background: info.bg,
                        padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap',
                      }}>{info.label}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>
                    {new Date(o.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Items */}
                <div style={{ fontSize: 13, color: '#374151', marginBottom: 14 }}>
                  {o.items.map((i: any) => `${i.productName} ×${i.quantity}`).join(', ')}
                </div>

                {/* Buyer */}
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>
                  Pembeli: <span style={{ fontWeight: 700, color: '#374151' }}>{o.buyer?.username || '-'}</span>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: 14, borderTop: '1px solid #F1F5F9',
                }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#2563EB' }}>
                    {formatRupiah(o.totalAmount)}
                  </span>
                  {o.status === 'SEDANG_DIKEMAS' && (
                    <button
                      onClick={() => handleProcess(o.id)}
                      style={{
                        padding: '9px 18px',
                        background: 'linear-gradient(135deg,#1D4ED8,#2563EB)',
                        color: 'white', border: 'none', borderRadius: 10,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}
                    >Proses Pesanan - Menunggu Pengirim</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
