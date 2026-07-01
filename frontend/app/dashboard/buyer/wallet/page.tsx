'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, CreditCard } from 'lucide-react';

const NAV = [
  { href: '/dashboard/buyer', label: 'Dashboard' },
  { href: '/dashboard/buyer/wallet', label: 'Dompet' },
  { href: '/dashboard/buyer/cart', label: 'Keranjang' },
  { href: '/dashboard/buyer/addresses', label: 'Alamat' },
  { href: '/dashboard/buyer/orders', label: 'Pesanan Saya' },
  { href: '/dashboard/buyer/report', label: 'Laporan Belanja' },
];

const TOPUP_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const TX_TYPE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  TOPUP:   { label: 'Top Up',     color: '#15803D', icon: ArrowDownLeft },
  PAYMENT: { label: 'Pembayaran', color: '#DC2626', icon: ArrowUpRight },
  EARNING: { label: 'Penghasilan',color: '#15803D', icon: ArrowDownLeft },
  REFUND:  { label: 'Refund',     color: '#1D4ED8', icon: RefreshCw },
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [topping, setTopping] = useState(false);

  const fetchWallet = () => {
    api.get('/buyer/wallet').then(r => setWallet(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleTopUp = async () => {
    const amt = parseInt(amount);
    if (!amt || amt < 10000) { toast.error('Minimal top-up Rp 10.000'); return; }
    setTopping(true);
    try {
      await api.post('/buyer/wallet/topup', { amount: amt });
      toast.success(`Top up ${formatRupiah(amt)} berhasil!`);
      fetchWallet();
      setAmount('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal top up');
    } finally {
      setTopping(false);
    }
  };

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Dompet Saya</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Kelola saldo dan riwayat transaksi</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Balance card */}
        <div
          style={{
            background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
            borderRadius: 22,
            padding: '36px 32px',
            color: '#fff',
            minHeight: 200,
          }}
        >
          <p style={{ fontSize: 11, opacity: 0.75, marginBottom: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>SALDO DOMPET</p>
          <p style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', marginBottom: 24 }}>
            {loading ? '-' : (wallet ? formatRupiah(wallet.balance) : formatRupiah(0))}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, opacity: 0.8 }}>
            <CreditCard className="w-4 h-4" />
            <span>SEAPEDIA Wallet</span>
          </div>
        </div>

        {/* Top Up card */}
        <div style={{ background: '#fff', borderRadius: 22, padding: 24, border: '1.5px solid #F1F5F9' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Top Up Saldo</p>

          {/* Quick amounts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {TOPUP_AMOUNTS.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                style={{
                  padding: '8px 4px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 20,
                  border: amount === String(a) ? '1.5px solid #1D4ED8' : '1.5px solid #E2E8F0',
                  background: amount === String(a) ? '#EFF6FF' : '#fff',
                  color: amount === String(a) ? '#1D4ED8' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {formatRupiah(a)}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <input
            type="number"
            placeholder="Jumlah lain (min Rp 10.000)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min={10000}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 13,
              border: '1.5px solid #E2E8F0',
              borderRadius: 12,
              outline: 'none',
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
          />

          <button
            onClick={handleTopUp}
            disabled={topping}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 12,
              border: 'none',
              background: topping ? '#93C5FD' : 'linear-gradient(135deg,#1D4ED8,#3B82F6)',
              color: '#fff',
              cursor: topping ? 'not-allowed' : 'pointer',
            }}
          >
            {topping ? 'Memproses...' : 'Top Up Sekarang'}
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          padding: 24,
          border: '1.5px solid #F1F5F9',
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>Riwayat Transaksi</p>

        {!wallet?.transactions?.length ? (
          <p style={{ color: '#94A3B8', fontSize: 14 }}>Belum ada transaksi</p>
        ) : (
          <div>
            {/* Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                padding: '8px 12px',
                fontSize: 12,
                color: '#94A3B8',
                fontWeight: 600,
                borderBottom: '1px solid #F1F5F9',
                marginBottom: 4,
              }}
            >
              <span>Transaksi</span>
              <span>Tanggal</span>
              <span style={{ textAlign: 'right' }}>Jumlah</span>
            </div>

            {wallet.transactions.map((tx: any) => {
              const info = TX_TYPE[tx.type] || { label: tx.type, color: '#64748B', icon: CreditCard };
              const Icon = info.icon;
              const isCredit = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: '1px solid #F8FAFC',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: isCredit ? '#DCFCE7' : '#FEE2E2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: info.color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{info.label}</p>
                      {tx.description && (
                        <p style={{ fontSize: 12, color: '#94A3B8' }}>{tx.description}</p>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748B' }}>
                    {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: info.color,
                      textAlign: 'right',
                    }}
                  >
                    {isCredit ? '+' : ''}{formatRupiah(tx.amount)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
