'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import { Package } from 'lucide-react';

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProducts = (p: number) => {
    setLoading(true);
    api.get(`/admin/products?page=${p}`)
      .then(r => { setProducts(r.data.data.products); setTotal(r.data.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(page); }, [page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Manajemen Produk</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>{total} produk terdaftar</p>
      </div>

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
              background: '#F5F3FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Package style={{ width: 16, height: 16, color: '#7C3AED' }} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Semua Produk ({total})
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 14 }}>Memuat...</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Nama Produk', 'Toko', 'Harga', 'Stok', 'Status'].map(h => (
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
                  {products.map(p => (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid #F8FAFC' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAFA'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{p.name}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{p.store?.name}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: 0 }}>{formatRupiah(p.price)}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{p.stock}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            background: p.isActive ? '#F0FDF4' : '#F8FAFC',
                            color: p.isActive ? '#059669' : '#94A3B8',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 20,
                          }}
                        >
                          {p.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
                        Belum ada produk
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <span style={{ fontSize: 13, color: '#64748B' }}>{page} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Berikutnya
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
