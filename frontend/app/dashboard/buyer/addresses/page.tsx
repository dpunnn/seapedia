'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/buyer', label: 'Dashboard' },
  { href: '/dashboard/buyer/wallet', label: 'Dompet' },
  { href: '/dashboard/buyer/cart', label: 'Keranjang' },
  { href: '/dashboard/buyer/addresses', label: 'Alamat' },
  { href: '/dashboard/buyer/orders', label: 'Pesanan Saya' },
  { href: '/dashboard/buyer/report', label: 'Laporan Belanja' },
];

const empty = { label: '', fullAddress: '', city: '', province: '', postalCode: '' };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetch = () => api.get('/buyer/addresses').then(r => setAddresses(r.data.data)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/buyer/addresses', form);
      toast.success('Alamat ditambahkan');
      setForm(empty);
      setShowForm(false);
      fetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    await api.post(`/buyer/addresses/${id}/default`);
    toast.success('Alamat default diubah');
    fetch();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/buyer/addresses/${id}`);
    toast.success('Alamat dihapus');
    fetch();
  };

  return (
    <DashboardLayout role="BUYER" navItems={NAV}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Alamat Pengiriman</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Tutup' : '+ Tambah Alamat'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Tambah Alamat Baru</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Label (misal: Rumah, Kantor)</Label>
                <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Alamat Lengkap</Label>
                <Input value={form.fullAddress} onChange={e => setForm(f => ({ ...f, fullAddress: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Kota</Label>
                <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Provinsi</Label>
                <Input value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Kode Pos</Label>
                <Input value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} required maxLength={6} />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? 'Menyimpan...' : 'Simpan Alamat'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : addresses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Belum ada alamat. Tambah alamat pengiriman.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map(a => (
            <Card key={a.id} className={a.isDefault ? 'border-blue-400' : ''}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{a.label}</p>
                    {a.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                  </div>
                  <p className="text-sm text-gray-600">{a.fullAddress}</p>
                  <p className="text-xs text-gray-400">{a.city}, {a.province} {a.postalCode}</p>
                </div>
                <div className="flex gap-2">
                  {!a.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(a.id)}>Jadikan Default</Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(a.id)}>Hapus</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
