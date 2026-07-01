'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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

const DELIVERY_OPTIONS = [
  { value: 'INSTANT', label: 'Instan (1 hari)', fee: 25000 },
  { value: 'NEXT_DAY', label: 'Besok (2 hari)', fee: 15000 },
  { value: 'REGULAR', label: 'Reguler (5 hari)', fee: 10000 },
];

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressId, setAddressId] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('REGULAR');
  const [discountCode, setDiscountCode] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [previewing, setPreviewing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = () => {
    api.get('/buyer/cart').then(r => setCart(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
    api.get('/buyer/addresses').then(r => {
      const addrs = r.data.data;
      setAddresses(addrs);
      const def = addrs.find((a: any) => a.isDefault);
      if (def) setAddressId(def.id);
    });
  }, []);

  const handleRemove = async (itemId: string) => {
    await api.delete(`/buyer/cart/items/${itemId}`);
    fetchCart();
    setPreview(null);
    toast.success('Item dihapus');
  };

  const handleClear = async () => {
    await api.delete('/buyer/cart');
    fetchCart();
    setPreview(null);
    toast.success('Keranjang dikosongkan');
  };

  const handlePreview = async () => {
    if (!addressId) { toast.error('Pilih alamat pengiriman'); return; }
    setPreviewing(true);
    try {
      const res = await api.post('/buyer/checkout/preview', {
        addressId, deliveryMethod, ...(discountCode && { discountCode }),
      });
      setPreview(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal preview checkout');
    } finally {
      setPreviewing(false);
    }
  };

  const handleCheckout = async () => {
    if (!addressId) { toast.error('Pilih alamat pengiriman'); return; }
    setCheckingOut(true);
    try {
      const res = await api.post('/buyer/checkout', {
        addressId, deliveryMethod, ...(discountCode && { discountCode }),
      });
      toast.success('Pesanan berhasil dibuat!');
      router.push(`/dashboard/buyer/orders/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout gagal');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      <p className="text-gray-500">Memuat keranjang...</p>
    </DashboardLayout>
  );

  const items = cart?.items ?? [];

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500 mb-3">Keranjang Anda kosong</p>
            <Button onClick={() => router.push('/products')}>Mulai Belanja</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Toko: <strong>{cart.store?.name}</strong></p>
              <button onClick={handleClear} className="text-xs text-red-500 hover:underline">Kosongkan</button>
            </div>
            {items.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-blue-600 text-sm font-bold">{formatRupiah(item.product.price)}</p>
                  </div>
                  <div className="flex items-center border rounded-lg">
                    <button className="px-2 py-1 hover:bg-gray-100" onClick={async () => {
                      if (item.quantity <= 1) { handleRemove(item.id); return; }
                      await api.put(`/buyer/cart/items/${item.id}`, { quantity: item.quantity - 1 });
                      fetchCart(); setPreview(null);
                    }}>−</button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button className="px-2 py-1 hover:bg-gray-100" onClick={async () => {
                      await api.put(`/buyer/cart/items/${item.id}`, { quantity: item.quantity + 1 });
                      fetchCart(); setPreview(null);
                    }}>+</button>
                  </div>
                  <p className="text-sm font-medium w-24 text-right">{formatRupiah(item.product.price * item.quantity)}</p>
                  <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-600 text-sm">×</button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Opsi Pengiriman</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Alamat</Label>
                  <Select value={addressId} onValueChange={v => setAddressId(v ?? '')}>
                    <SelectTrigger><SelectValue placeholder="Pilih alamat" /></SelectTrigger>
                    <SelectContent>
                      {addresses.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.label} - {a.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Metode Pengiriman</Label>
                  {DELIVERY_OPTIONS.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => { setDeliveryMethod(opt.value); setPreview(null); }}
                      className={`w-full text-left p-2 text-sm rounded-lg border mb-1 ${deliveryMethod === opt.value ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
                    >
                      <span>{opt.label}</span>
                      <span className="float-right text-blue-600">{formatRupiah(opt.fee)}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Kode Diskon</Label>
                  <Input placeholder="SEAPEDIA10" value={discountCode} onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setPreview(null); }} />
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={handlePreview} disabled={previewing}>
                  {previewing ? 'Menghitung...' : 'Hitung Total'}
                </Button>
              </CardContent>
            </Card>

            {preview && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Rincian Pembayaran</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatRupiah(preview.subtotal)}</span></div>
                  {preview.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600"><span>Diskon</span><span>-{formatRupiah(preview.discountAmount)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-gray-500">PPN 12%</span><span>{formatRupiah(preview.ppnAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Ongkir</span><span>{formatRupiah(preview.deliveryFee)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-blue-600">{formatRupiah(preview.total)}</span></div>
                  <Button className="w-full mt-2" onClick={handleCheckout} disabled={checkingOut}>
                    {checkingOut ? 'Memproses...' : 'Bayar Sekarang'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
