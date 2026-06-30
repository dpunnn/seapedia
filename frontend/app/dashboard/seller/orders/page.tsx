'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  SEDANG_DIKEMAS: { label: 'Dikemas', color: 'bg-yellow-100 text-yellow-700' },
  MENUNGGU_PENGIRIM: { label: 'Menunggu Driver', color: 'bg-blue-100 text-blue-700' },
  SEDANG_DIKIRIM: { label: 'Dikirim', color: 'bg-orange-100 text-orange-700' },
  PESANAN_SELESAI: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  DIKEMBALIKAN: { label: 'Dikembalikan', color: 'bg-red-100 text-red-700' },
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    const params = status !== 'all' ? `?status=${status}` : '';
    api.get(`/seller/orders${params}`).then(r => setOrders(r.data.data.orders || [])).finally(() => setLoading(false));
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pesanan Masuk</h1>
        <Select value={status} onValueChange={v => setStatus(v ?? 'all')}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {Object.entries(STATUS_MAP).map(([v, s]) => (
              <SelectItem key={v} value={v}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? <p className="text-gray-500">Memuat...</p> : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">Tidak ada pesanan</p>
      ) : (
        <div className="space-y-3">
          {orders.map(o => {
            const info = STATUS_MAP[o.status];
            return (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">#{o.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{o.buyer?.username} · {new Date(o.createdAt).toLocaleDateString('id-ID')}</p>
                      <p className="text-sm mt-1">
                        {o.items.map((i: any) => `${i.productName} ×${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-blue-600 font-bold text-sm mt-1">{formatRupiah(o.totalAmount)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {info && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${info.color}`}>{info.label}</span>
                      )}
                      {o.status === 'SEDANG_DIKEMAS' && (
                        <Button size="sm" onClick={() => handleProcess(o.id)}>Proses</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
