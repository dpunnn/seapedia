'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
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

const emptyForm = { code: '', discountType: 'PERCENTAGE', discountValue: '', minPurchase: '0', maxDiscount: '', expiryDate: '', usageLimit: '10' };

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchVouchers = () => api.get('/admin/vouchers').then(r => setVouchers(r.data.data));
  useEffect(() => { fetchVouchers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/vouchers', {
        ...form,
        discountValue: parseFloat(form.discountValue),
        minPurchase: parseFloat(form.minPurchase),
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
        usageLimit: parseInt(form.usageLimit),
        expiryDate: new Date(form.expiryDate).toISOString(),
      });
      toast.success('Voucher dibuat');
      setForm(emptyForm); setShowForm(false);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Voucher</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Tutup' : '+ Buat Voucher'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 max-w-lg">
          <CardHeader><CardTitle className="text-sm">Buat Voucher</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Kode</Label>
                  <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required />
                </div>
                <div className="space-y-1">
                  <Label>Tipe Diskon</Label>
                  <Select value={form.discountType} onValueChange={v => setForm(f => ({ ...f, discountType: v ?? 'PERCENTAGE' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Persentase (%)</SelectItem>
                      <SelectItem value="FIXED">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Nilai Diskon</Label>
                  <Input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} required />
                </div>
                <div className="space-y-1">
                  <Label>Maks. Diskon (Rp)</Label>
                  <Input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} placeholder="Opsional" />
                </div>
                <div className="space-y-1">
                  <Label>Min. Pembelian</Label>
                  <Input type="number" value={form.minPurchase} onChange={e => setForm(f => ({ ...f, minPurchase: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Limit Penggunaan</Label>
                  <Input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} required />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Tanggal Kedaluwarsa</Label>
                  <Input type="datetime-local" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} required />
                </div>
              </div>
              <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Buat Voucher'}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {vouchers.map(v => (
          <Card key={v.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <code className="font-bold text-blue-600">{v.code}</code>
                  <Badge variant={v.isActive ? 'default' : 'secondary'}>
                    {v.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatRupiah(v.discountValue)} diskon
                  {v.minPurchase > 0 && ` · min. ${formatRupiah(v.minPurchase)}`}
                </p>
                <p className="text-xs text-gray-400">
                  Exp: {new Date(v.expiryDate).toLocaleDateString('id-ID')} · Digunakan: {v.usedCount}/{v.usageLimit}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
