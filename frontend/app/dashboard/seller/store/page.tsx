'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/seller', label: 'Dashboard' },
  { href: '/dashboard/seller/store', label: 'Toko Saya' },
  { href: '/dashboard/seller/products', label: 'Produk' },
  { href: '/dashboard/seller/orders', label: 'Pesanan' },
  { href: '/dashboard/seller/income', label: 'Pendapatan' },
];

export default function SellerStorePage() {
  const [store, setStore] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const fetchStore = () => {
    api.get('/seller/store').then(r => {
      setStore(r.data.data);
      setForm({ name: r.data.data.name, description: r.data.data.description || '' });
    }).catch(() => setStore(null)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStore(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (store) {
        await api.put('/seller/store', form);
        toast.success('Toko berhasil diupdate');
        setEditing(false);
      } else {
        await api.post('/seller/store', form);
        toast.success('Toko berhasil dibuat!');
      }
      fetchStore();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      <p>Memuat...</p>
    </DashboardLayout>
  );

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Toko Saya</h1>

      {store && !editing ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>{store.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">{store.description || 'Belum ada deskripsi'}</p>
            <p className="text-sm text-gray-500">Total produk: {store._count?.products ?? 0}</p>
            <Button size="sm" onClick={() => setEditing(true)}>Edit Toko</Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-lg">
          <CardHeader><CardTitle className="text-base">{store ? 'Edit Toko' : 'Buat Toko Baru'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Nama Toko</Label>
                <Input
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Toko Saya" required minLength={3}
                />
              </div>
              <div className="space-y-1">
                <Label>Deskripsi (opsional)</Label>
                <Input
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ceritakan tentang toko Anda"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Menyimpan...' : (store ? 'Update' : 'Buat Toko')}
                </Button>
                {editing && <Button type="button" variant="outline" onClick={() => setEditing(false)}>Batal</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
