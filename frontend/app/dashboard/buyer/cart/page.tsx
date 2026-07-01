'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import { Minus, Plus, X, Package, Truck, Zap, Clock } from 'lucide-react';

const NAV = [
  { href: '/dashboard/buyer', label: 'Dashboard' },
  { href: '/dashboard/buyer/wallet', label: 'Dompet' },
  { href: '/dashboard/buyer/cart', label: 'Keranjang' },
  { href: '/dashboard/buyer/addresses', label: 'Alamat' },
  { href: '/dashboard/buyer/orders', label: 'Pesanan Saya' },
  { href: '/dashboard/buyer/report', label: 'Laporan Belanja' },
];

const DELIVERY_OPTIONS = [
  { value: 'INSTANT',  label: 'Instan',  sublabel: '1 hari', fee: 25000,  icon: Zap },
  { value: 'NEXT_DAY', label: 'Besok',   sublabel: '2 hari', fee: 15000,  icon: Truck },
  { value: 'REGULAR',  label: 'Reguler', sublabel: '5 hari', fee: 10000,  icon: Clock },
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
      <p style={{ color: '#94A3B8' }}>Memuat keranjang...</p>
    </DashboardLayout>
  );

  const items = cart?.items ?? [];

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Keranjang Belanja</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
          {items.length > 0 ? `${items.length} item dari ${cart?.store?.name ?? 'toko'}` : 'Keranjang Anda kosong'}
        </p>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 48,
            textAlign: 'center',
            border: '1.5px solid #F1F5F9',
          }}
        >
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: '#CBD5E1' }} />
          <p style={{ color: '#64748B', marginBottom: 16 }}>Keranjang Anda kosong</p>
          <button
            onClick={() => router.push('/products')}
            style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
              color: '#fff',
              borderRadius: 12,
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Mulai Belanja
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          {/* Cart items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: 13, color: '#64748B' }}>
                Toko: <strong style={{ color: '#0F172A' }}>{cart.store?.name}</strong>
              </p>
              <button
                onClick={handleClear}
                style={{ fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Kosongkan Keranjang
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: 16,
                    border: '1.5px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  {/* Product image */}
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 14,
                      background: '#F1F5F9',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Package className="w-8 h-8" style={{ color: '#CBD5E1' }} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                      {item.product.name}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1D4ED8' }}>
                      {formatRupiah(item.product.price)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                      onClick={async () => {
                        if (item.quantity <= 1) { handleRemove(item.id); return; }
                        await api.put(`/buyer/cart/items/${item.id}`, { quantity: item.quantity - 1 });
                        fetchCart(); setPreview(null);
                      }}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span style={{ padding: '6px 12px', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                      {item.quantity}
                    </span>
                    <button
                      style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                      onClick={async () => {
                        await api.put(`/buyer/cart/items/${item.id}`, { quantity: item.quantity + 1 });
                        fetchCart(); setPreview(null);
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', width: 96, textAlign: 'right' }}>
                    {formatRupiah(item.product.price * item.quantity)}
                  </p>

                  <button
                    onClick={() => handleRemove(item.id)}
                    style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Delivery method */}
            <div
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: 20,
                border: '1.5px solid #F1F5F9',
                marginTop: 16,
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Metode Pengiriman</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DELIVERY_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = deliveryMethod === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setDeliveryMethod(opt.value); setPreview(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 12,
                        border: isSelected ? '1.5px solid #3B82F6' : '1.5px solid #E2E8F0',
                        background: isSelected ? '#EFF6FF' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Icon className="w-4 h-4" style={{ color: isSelected ? '#1D4ED8' : '#94A3B8' }} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#1D4ED8' : '#0F172A' }}>
                            {opt.label}
                          </p>
                          <p style={{ fontSize: 12, color: '#94A3B8' }}>{opt.sublabel}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>
                        {formatRupiah(opt.fee)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: 24,
                border: '1.5px solid #F1F5F9',
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Ringkasan Pesanan</p>

              {/* Address */}
              <div style={{ marginBottom: 16 }}>
                <Label className="text-xs" style={{ color: '#94A3B8', marginBottom: 6, display: 'block' }}>
                  Alamat Pengiriman
                </Label>
                <Select value={addressId} onValueChange={v => setAddressId(v ?? '')}>
                  <SelectTrigger style={{ border: '1.5px solid #E2E8F0', borderRadius: 12 }}>
                    <SelectValue placeholder="Pilih alamat" />
                  </SelectTrigger>
                  <SelectContent>
                    {addresses.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.label} - {a.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discount code */}
              <div style={{ marginBottom: 16 }}>
                <Label className="text-xs" style={{ color: '#94A3B8', marginBottom: 6, display: 'block' }}>
                  Kode Diskon
                </Label>
                <input
                  type="text"
                  placeholder="SEAPEDIA10"
                  value={discountCode}
                  onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setPreview(null); }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 13,
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 12,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                onClick={handlePreview}
                disabled={previewing}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 12,
                  background: '#fff',
                  color: '#475569',
                  cursor: previewing ? 'not-allowed' : 'pointer',
                  marginBottom: 16,
                }}
              >
                {previewing ? 'Menghitung...' : 'Hitung Total'}
              </button>

              {preview && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>Subtotal</span>
                    <span style={{ fontSize: 13, color: '#0F172A' }}>{formatRupiah(preview.subtotal)}</span>
                  </div>
                  {preview.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: '#15803D' }}>Diskon</span>
                      <span style={{ fontSize: 13, color: '#15803D' }}>-{formatRupiah(preview.discountAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>PPN 12%</span>
                    <span style={{ fontSize: 13, color: '#0F172A' }}>{formatRupiah(preview.ppnAmount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>Ongkir</span>
                    <span style={{ fontSize: 13, color: '#0F172A' }}>{formatRupiah(preview.deliveryFee)}</span>
                  </div>
                  <div
                    style={{
                      borderTop: '1.5px solid #F1F5F9',
                      paddingTop: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Total</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#1D4ED8' }}>{formatRupiah(preview.total)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkingOut || !preview}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: 15,
                  fontWeight: 800,
                  borderRadius: 14,
                  border: 'none',
                  background: (checkingOut || !preview)
                    ? '#CBD5E1'
                    : 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                  color: '#fff',
                  cursor: (checkingOut || !preview) ? 'not-allowed' : 'pointer',
                }}
              >
                {checkingOut ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
              {!preview && (
                <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
                  Hitung total dulu sebelum checkout
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
