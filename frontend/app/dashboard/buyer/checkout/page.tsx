'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import {
  MapPin,
  Truck,
  Tag,
  CheckCircle,
  XCircle,
  ShoppingBag,
  CreditCard,
  Loader2,
  X,
  Zap,
  Clock,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard/buyer', label: 'Dashboard' },
  { href: '/dashboard/buyer/wallet', label: 'Dompet' },
  { href: '/dashboard/buyer/cart', label: 'Keranjang' },
  { href: '/dashboard/buyer/addresses', label: 'Alamat' },
  { href: '/dashboard/buyer/orders', label: 'Pesanan Saya' },
  { href: '/dashboard/buyer/report', label: 'Laporan Belanja' },
];

const DELIVERY_OPTIONS = [
  { value: 'INSTANT',  label: 'Instan',  sublabel: 'Tiba hari ini', fee: 25000, icon: Zap },
  { value: 'NEXT_DAY', label: 'Besok',   sublabel: 'Tiba besok',    fee: 15000, icon: Truck },
  { value: 'REGULAR',  label: 'Reguler', sublabel: 'Tiba 3-5 hari', fee: 10000, icon: Clock },
];

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [addressId, setAddressId] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('REGULAR');
  const [discountCode, setDiscountCode] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [discountResult, setDiscountResult] = useState<any>(null);
  const [discountStatus, setDiscountStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validating, setValidating] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cartRes, addrRes, walletRes] = await Promise.all([
          api.get('/buyer/cart'),
          api.get('/buyer/addresses'),
          api.get('/buyer/wallet'),
        ]);

        const cartData = cartRes.data.data;
        const addrData = addrRes.data.data;
        const walletData = walletRes.data.data;

        if (!cartData?.items?.length) {
          router.push('/dashboard/buyer/cart');
          return;
        }

        setCart(cartData);
        setAddresses(addrData);
        setWallet(walletData);

        const def = addrData.find((a: any) => a.isDefault);
        if (def) setAddressId(def.id);
      } catch {
        toast.error('Gagal memuat data checkout');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [router]);

  const handleValidateDiscount = async () => {
    if (!discountInput.trim()) return;
    setValidating(true);
    setDiscountStatus('idle');
    setDiscountResult(null);
    try {
      const res = await api.post('/buyer/discount/validate', {
        code: discountInput.trim().toUpperCase(),
        subtotal,
      });
      setDiscountResult(res.data.data);
      setDiscountCode(discountInput.trim().toUpperCase());
      setDiscountStatus('valid');
    } catch (err: any) {
      setDiscountStatus('invalid');
      setDiscountResult(null);
      setDiscountCode('');
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setDiscountInput('');
    setDiscountResult(null);
    setDiscountStatus('idle');
  };

  const items = cart?.items ?? [];
  const subtotal = items.reduce(
    (acc: number, item: any) => acc + item.product.price * item.quantity,
    0
  );
  const discountAmount = discountResult?.discountAmount ?? 0;
  const deliveryFee = DELIVERY_OPTIONS.find(d => d.value === deliveryMethod)?.fee ?? 10000;
  const ppnBase = subtotal - discountAmount;
  const ppnAmount = ppnBase * 0.12;
  const total = ppnBase + ppnAmount + deliveryFee;
  const walletBalance = wallet?.balance ?? 0;
  const saldoInsufficient = walletBalance < total;

  const handleSubmit = async () => {
    if (!addressId) { toast.error('Pilih alamat pengiriman'); return; }
    setSubmitting(true);
    try {
      await api.post('/buyer/checkout', {
        addressId,
        deliveryMethod,
        ...(discountCode ? { discountCode } : {}),
      });
      toast.success('Pesanan berhasil dibuat!');
      router.push('/dashboard/buyer/orders');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout gagal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="BUYER" navItems={NAV}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8' }}>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat checkout...</span>
        </div>
      </DashboardLayout>
    );
  }

  const selectedAddress = addresses.find(a => a.id === addressId);

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Checkout</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
          Periksa pesanan Anda sebelum konfirmasi
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Address */}
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              border: '1.5px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MapPin className="w-4 h-4" style={{ color: '#1D4ED8' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Alamat Pengiriman</p>
            </div>

            {addresses.length === 0 ? (
              <div>
                <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>
                  Belum ada alamat tersimpan.
                </p>
                <Link
                  href="/dashboard/buyer/addresses"
                  style={{ fontSize: 13, color: '#1D4ED8', fontWeight: 600 }}
                >
                  + Tambah Alamat
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {addresses.map((addr: any) => {
                  const isSelected = addressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setAddressId(addr.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 12,
                        border: isSelected ? '1.5px solid #3B82F6' : '1.5px solid #E2E8F0',
                        background: isSelected ? '#EFF6FF' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? '#1D4ED8' : '#0F172A', marginBottom: 2 }}>
                          {addr.label}
                          {addr.isDefault && (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 10,
                                fontWeight: 700,
                                background: '#DBEAFE',
                                color: '#1D4ED8',
                                borderRadius: 6,
                                padding: '2px 6px',
                              }}
                            >
                              Default
                            </span>
                          )}
                        </p>
                        <p style={{ fontSize: 12, color: '#64748B' }}>{addr.fullAddress}</p>
                        <p style={{ fontSize: 12, color: '#94A3B8' }}>{addr.city}, {addr.province} {addr.postalCode}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#3B82F6', marginTop: 2 }} />
                      )}
                    </button>
                  );
                })}
                <Link
                  href="/dashboard/buyer/addresses"
                  style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600, marginTop: 4 }}
                >
                  + Kelola Alamat
                </Link>
              </div>
            )}
          </div>

          {/* Delivery method */}
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              border: '1.5px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Truck className="w-4 h-4" style={{ color: '#1D4ED8' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Metode Pengiriman</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DELIVERY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = deliveryMethod === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDeliveryMethod(opt.value)}
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

          {/* Discount code */}
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              border: '1.5px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Tag className="w-4 h-4" style={{ color: '#1D4ED8' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Kode Diskon</p>
            </div>

            {discountStatus === 'valid' ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#DCFCE7',
                  border: '1.5px solid #86EFAC',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle className="w-4 h-4" style={{ color: '#15803D' }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>{discountCode}</p>
                    <p style={{ fontSize: 12, color: '#16A34A' }}>
                      Hemat {formatRupiah(discountAmount)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveDiscount}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <X className="w-4 h-4" style={{ color: '#15803D' }} />
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Masukkan kode voucher"
                    value={discountInput}
                    onChange={e => {
                      setDiscountInput(e.target.value.toUpperCase());
                      setDiscountStatus('idle');
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      fontSize: 13,
                      border: discountStatus === 'invalid' ? '1.5px solid #FCA5A5' : '1.5px solid #E2E8F0',
                      borderRadius: 12,
                      outline: 'none',
                      background: discountStatus === 'invalid' ? '#FFF5F5' : '#fff',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleValidateDiscount}
                    disabled={validating || !discountInput.trim()}
                    style={{
                      padding: '10px 18px',
                      fontSize: 13,
                      fontWeight: 700,
                      borderRadius: 12,
                      border: 'none',
                      background: (validating || !discountInput.trim()) ? '#CBD5E1' : 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                      color: '#fff',
                      cursor: (validating || !discountInput.trim()) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Terapkan
                  </button>
                </div>
                {discountStatus === 'invalid' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <XCircle className="w-4 h-4" style={{ color: '#DC2626' }} />
                    <p style={{ fontSize: 12, color: '#DC2626' }}>Kode diskon tidak valid atau sudah kadaluarsa</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Items list */}
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              border: '1.5px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ShoppingBag className="w-4 h-4" style={{ color: '#1D4ED8' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                Item Pesanan ({items.length})
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #F8FAFC',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{item.product.name}</p>
                    <p style={{ fontSize: 12, color: '#64748B' }}>
                      {formatRupiah(item.product.price)} x {item.quantity}
                    </p>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    {formatRupiah(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Order summary */}
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

            {/* Item list compact */}
            <div style={{ marginBottom: 16 }}>
              {items.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 12, color: '#64748B', flex: 1, marginRight: 8 }}>
                    {item.product.name} x{item.quantity}
                  </span>
                  <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatRupiah(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12, marginBottom: 4 }}>
              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Subtotal</span>
                <span style={{ fontSize: 13, color: '#0F172A' }}>{formatRupiah(subtotal)}</span>
              </div>

              {/* Discount */}
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, color: '#15803D' }}>Diskon</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: '#DCFCE7',
                        color: '#15803D',
                        borderRadius: 6,
                        padding: '1px 6px',
                      }}
                    >
                      {discountResult?.type === 'VOUCHER' ? 'VOUCHER' : 'PROMO'}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, color: '#15803D', fontWeight: 600 }}>
                    -{formatRupiah(discountAmount)}
                  </span>
                </div>
              )}

              {/* Delivery fee */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Ongkos Kirim</span>
                <span style={{ fontSize: 13, color: '#0F172A' }}>{formatRupiah(deliveryFee)}</span>
              </div>

              {/* PPN */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>PPN 12%</span>
                <span style={{ fontSize: 13, color: '#0F172A' }}>{formatRupiah(ppnAmount)}</span>
              </div>
            </div>

            {/* Total */}
            <div
              style={{
                borderTop: '1.5px solid #E2E8F0',
                paddingTop: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>TOTAL</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#1D4ED8' }}>
                {formatRupiah(total)}
              </span>
            </div>

            {/* Wallet balance */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 12,
                background: saldoInsufficient ? '#FFF5F5' : '#F0F9FF',
                border: `1.5px solid ${saldoInsufficient ? '#FECACA' : '#BAE6FD'}`,
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard className="w-4 h-4" style={{ color: saldoInsufficient ? '#DC2626' : '#0369A1' }} />
                <span style={{ fontSize: 13, color: saldoInsufficient ? '#DC2626' : '#0369A1', fontWeight: 600 }}>
                  Saldo Wallet
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: saldoInsufficient ? '#DC2626' : '#0369A1' }}>
                {formatRupiah(walletBalance)}
              </span>
            </div>
            {saldoInsufficient && (
              <p style={{ fontSize: 12, color: '#DC2626', marginBottom: 12, textAlign: 'center' }}>
                Saldo tidak mencukupi. Top up terlebih dahulu.
              </p>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !addressId || saldoInsufficient}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 15,
                fontWeight: 800,
                borderRadius: 14,
                border: 'none',
                background: (submitting || !addressId || saldoInsufficient)
                  ? '#CBD5E1'
                  : 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
                color: '#fff',
                cursor: (submitting || !addressId || saldoInsufficient) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Konfirmasi Pesanan'
              )}
            </button>

            {!addressId && (
              <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
                Pilih alamat pengiriman terlebih dahulu
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
