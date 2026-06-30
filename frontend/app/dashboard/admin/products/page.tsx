'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

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
      <h1 className="text-2xl font-bold mb-6">Manajemen Produk</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Semua Produk ({total})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 py-4">Memuat...</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 pr-4">Nama Produk</th>
                      <th className="pb-2 pr-4">Toko</th>
                      <th className="pb-2 pr-4">Harga</th>
                      <th className="pb-2 pr-4">Stok</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 pr-4 font-medium">{p.name}</td>
                        <td className="py-2 pr-4 text-gray-500">{p.store?.name}</td>
                        <td className="py-2 pr-4">{formatRupiah(p.price)}</td>
                        <td className="py-2 pr-4">{p.stock}</td>
                        <td className="py-2">
                          <Badge variant={p.isActive ? 'default' : 'secondary'}>
                            {p.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <p className="text-center py-8 text-gray-400">Belum ada produk</p>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-gray-500">{page} / {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Berikutnya
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
