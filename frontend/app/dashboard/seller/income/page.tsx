'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { formatRupiah } from '@/lib/auth';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/seller', label: 'Dashboard' },
  { href: '/dashboard/seller/store', label: 'Toko Saya' },
  { href: '/dashboard/seller/products', label: 'Produk' },
  { href: '/dashboard/seller/orders', label: 'Pesanan' },
  { href: '/dashboard/seller/income', label: 'Pendapatan' },
];

export default function SellerIncomePage() {
  const [income, setIncome] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/seller/income')
      .then(r => setIncome(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="SELLER" navItems={NAV}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 0' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #059669', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Laporan Pendapatan</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>Laporan pendapatan toko</p>
      </div>

      {income ? (
        <>
          {/* Income Hero Card */}
          <div style={{
            background: 'linear-gradient(135deg,#059669,#34D399)',
            borderRadius: 22, padding: 32, marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.75)', textTransform: 'uppercase', marginBottom: 8 }}>
              Total Pendapatan (Pesanan Selesai)
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, color: 'white', marginBottom: 6 }}>
              {formatRupiah(income.totalIncome)}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>
              Dihitung otomatis dari pesanan berstatus "Pesanan Selesai" — pesanan yang di-refund/overdue otomatis tidak terhitung.
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 22, border: '1.5px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Pesanan Selesai</span>
                <div style={{ width: 36, height: 36, background: '#F0FDF4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={17} color="#16A34A" />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0F172A' }}>{income.orderCount}</div>
            </div>
            <div style={{ background: 'white', borderRadius: 20, padding: 22, border: '1.5px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Rata-rata per Pesanan</span>
                <div style={{ width: 36, height: 36, background: '#F0FDF4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={17} color="#059669" />
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>
                {income.orderCount > 0 ? formatRupiah(income.totalIncome / income.orderCount) : '-'}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #F1F5F9', overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #F1F5F9', fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
              Rincian Pesanan Selesai
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#F8FAFC' }}>
                <tr>
                  {['Pesanan', 'Tanggal', 'Total'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8',
                      padding: '12px 20px', textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {income.orders && income.orders.length > 0 ? income.orders.map((o: any) => (
                  <tr key={o.id || Math.random()} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#2563EB' }}>
                      #{(o.id || '').slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748B' }}>
                      {new Date(o.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 800, color: '#16A34A' }}>
                      +{formatRupiah(o.totalAmount - (o.deliveryFee || 0))}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', fontSize: 13 }}>
                      Belum ada pesanan selesai
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{
          textAlign: 'center', padding: '64px 20px', background: 'white',
          borderRadius: 20, color: '#94A3B8', fontSize: 13, border: '1.5px solid #F1F5F9',
        }}>
          Belum ada data pendapatan
        </div>
      )}
    </DashboardLayout>
  );
}
