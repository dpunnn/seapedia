'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const TOPUP_AMOUNTS = [50000, 100000, 200000, 500000];

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

  const TX_TYPE: Record<string, { label: string; color: string }> = {
    TOPUP: { label: 'Top Up', color: 'text-green-600' },
    PAYMENT: { label: 'Pembayaran', color: 'text-red-600' },
    EARNING: { label: 'Penghasilan', color: 'text-green-600' },
    REFUND: { label: 'Refund', color: 'text-blue-600' },
  };

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Dompet Saya</h1>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-2">Saldo Saat Ini</p>
            <p className="text-3xl font-bold text-blue-600">
              {wallet ? formatRupiah(wallet.balance) : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Up Saldo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {TOPUP_AMOUNTS.map(a => (
                <button key={a} type="button"
                  onClick={() => setAmount(String(a))}
                  className={`p-2 text-sm border rounded-lg hover:border-blue-400 transition-colors ${amount === String(a) ? 'border-blue-500 bg-blue-50' : ''}`}
                >
                  {formatRupiah(a)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="number" placeholder="Jumlah lain..."
                value={amount} onChange={e => setAmount(e.target.value)}
                min={10000}
              />
              <Button onClick={handleTopUp} disabled={topping}>
                {topping ? 'Proses...' : 'Top Up'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 max-w-3xl">
        <CardHeader><CardTitle className="text-base">Riwayat Transaksi</CardTitle></CardHeader>
        <CardContent>
          {!wallet?.transactions?.length ? (
            <p className="text-sm text-gray-500">Belum ada transaksi</p>
          ) : (
            <div className="space-y-2">
              {wallet.transactions.map((tx: any) => {
                const info = TX_TYPE[tx.type] || { label: tx.type, color: 'text-gray-600' };
                return (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{info.label}</p>
                      <p className="text-xs text-gray-500">{tx.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                    <p className={`text-sm font-bold ${info.color}`}>
                      {tx.amount > 0 ? '+' : ''}{formatRupiah(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
