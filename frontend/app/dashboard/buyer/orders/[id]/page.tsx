'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/buyer', label: 'Dashboard' },
  { href: '/dashboard/buyer/wallet', label: 'Dompet' },
  { href: '/dashboard/buyer/cart', label: 'Keranjang' },
  { href: '/dashboard/buyer/addresses', label: 'Alamat' },
  { href: '/dashboard/buyer/orders', label: 'Pesanan Saya' },
  { href: '/dashboard/buyer/report', label: 'Laporan Belanja' },
];

const STATUS_STEPS = ['SEDANG_DIKEMAS', 'MENUNGGU_PENGIRIM', 'SEDANG_DIKIRIM', 'PESANAN_SELESAI'];
const STATUS_LABELS: Record<string, string> = {
  SEDANG_DIKEMAS: 'Dikemas',
  MENUNGGU_PENGIRIM: 'Menunggu Driver',
  SEDANG_DIKIRIM: 'Dikirim',
  PESANAN_SELESAI: 'Selesai',
  DIKEMBALIKAN: 'Dikembalikan',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/buyer/orders/${id}`).then(r => setOrder(r.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      <p className="text-gray-500">Memuat...</p>
    </DashboardLayout>
  );

  if (!order) return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      <p className="text-gray-500">Pesanan tidak ditemukan</p>
    </DashboardLayout>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      <div className="mb-4">
        <Link href="/dashboard/buyer/orders" className="text-sm text-blue-600 hover:underline">← Kembali</Link>
      </div>

      <h1 className="text-xl font-bold mb-6">Pesanan #{order.id.slice(-8).toUpperCase()}</h1>

      {/* Status tracker */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  {i + 1}
                </div>
                <p className={`text-xs mt-1 text-center ${i <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                  {STATUS_LABELS[s]}
                </p>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`absolute h-0.5 w-full ${i < currentStep ? 'bg-blue-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Detail Pesanan</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-sm">Info Pengiriman</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><span className="text-gray-500">Toko:</span> {order.store?.name}</p>
            <p><span className="text-gray-500">Alamat:</span> {order.address?.fullAddress}, {order.address?.city}</p>
            {order.deliveryJob?.driver && (
              <p><span className="text-gray-500">Driver:</span> {order.deliveryJob.driver.username}</p>
            )}
            <p><span className="text-gray-500">Tanggal:</span> {new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status history */}
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-sm">Riwayat Status</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.statusHistory.map((h: any) => (
              <div key={h.id} className="flex gap-3 text-sm">
                <span className="text-gray-400 w-36 flex-shrink-0">
                  {new Date(h.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                </span>
                <div>
                  <span className="font-medium">{STATUS_LABELS[h.status] || h.status}</span>
                  {h.note && <p className="text-gray-500 text-xs">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
