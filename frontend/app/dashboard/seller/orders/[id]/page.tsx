'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  SEDANG_DIKEMAS: { label: 'Sedang Dikemas', color: 'bg-yellow-100 text-yellow-700' },
  MENUNGGU_PENGIRIM: { label: 'Menunggu Driver', color: 'bg-blue-100 text-blue-700' },
  SEDANG_DIKIRIM: { label: 'Sedang Dikirim', color: 'bg-orange-100 text-orange-700' },
  PESANAN_SELESAI: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
  DIKEMBALIKAN: { label: 'Dikembalikan', color: 'bg-red-100 text-red-700' },
};

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchOrder = () => {
    api.get(`/seller/orders/${id}`).then(r => setOrder(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await api.post(`/seller/orders/${id}/process`);
      toast.success('Pesanan diproses, menunggu driver');
      fetchOrder();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      <p className="text-gray-500">Memuat...</p>
    </DashboardLayout>
  );

  if (!order) return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      <p className="text-gray-500">Pesanan tidak ditemukan</p>
    </DashboardLayout>
  );

  const statusInfo = STATUS_MAP[order.status];

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      <div className="mb-4">
        <Link href="/dashboard/seller/orders" className="text-sm text-blue-600 hover:underline">← Kembali ke Pesanan</Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Pesanan #{order.id.slice(-8).toUpperCase()}</h1>
        <div className="flex items-center gap-3">
          {statusInfo && (
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          )}
          {order.status === 'SEDANG_DIKEMAS' && (
            <Button onClick={handleProcess} disabled={processing}>
              {processing ? 'Memproses...' : 'Proses Pesanan'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Detail Produk</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600">{item.productName} × {item.quantity}</span>
                <span>{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span></div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600"><span>Diskon</span><span>-{formatRupiah(order.discountAmount)}</span></div>
            )}
            <div className="flex justify-between text-gray-500"><span>PPN 12%</span><span>{formatRupiah(order.ppnAmount)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Ongkir ({order.deliveryMethod})</span><span>{formatRupiah(order.deliveryFee)}</span></div>
            <Separator />
            <div className="flex justify-between font-bold"><span>Total</span><span className="text-blue-600">{formatRupiah(order.totalAmount)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Info Pembeli & Pengiriman</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><span className="text-gray-500">Pembeli:</span> {order.buyer?.username}</p>
            <p><span className="text-gray-500">Alamat:</span> {order.address?.fullAddress}, {order.address?.city}</p>
            <p><span className="text-gray-500">Provinsi:</span> {order.address?.province} {order.address?.postalCode}</p>
            {order.deliveryJob?.driver && (
              <p><span className="text-gray-500">Driver:</span> {order.deliveryJob.driver.username}</p>
            )}
            <p><span className="text-gray-500">Tanggal Order:</span> {new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
          </CardContent>
        </Card>
      </div>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-sm">Riwayat Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.statusHistory.map((h: any) => (
                <div key={h.id} className="flex gap-3 text-sm">
                  <span className="text-gray-400 w-40 flex-shrink-0">
                    {new Date(h.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div>
                    <span className="font-medium">{STATUS_MAP[h.status]?.label || h.status}</span>
                    {h.note && <p className="text-gray-500 text-xs">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
