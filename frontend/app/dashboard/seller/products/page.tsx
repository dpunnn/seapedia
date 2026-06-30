'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

const emptyForm = { name: '', description: '', price: '', stock: '', imageUrl: '' };

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    api.get('/seller/products', { params: { search } })
      .then(r => { setProducts(r.data.data.products); setTotal(r.data.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
    try {
      if (editId) {
        await api.put(`/seller/products/${editId}`, payload);
        toast.success('Produk diupdate');
      } else {
        await api.post('/seller/products', payload);
        toast.success('Produk ditambahkan');
      }
      setForm(emptyForm); setEditId(null); setShowForm(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: any) => {
    setForm({ name: p.name, description: p.description || '', price: String(p.price), stock: String(p.stock), imageUrl: p.imageUrl || '' });
    setEditId(p.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/seller/products/${id}`);
    toast.success('Produk dihapus');
    fetchProducts();
  };

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produk Saya ({total})</h1>
        <Button size="sm" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}>
          {showForm ? 'Tutup' : '+ Tambah Produk'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">{editId ? 'Edit Produk' : 'Tambah Produk'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Nama Produk</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required minLength={3} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Deskripsi (opsional)</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Harga (Rp)</Label>
                <Input type="number" min={1} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label>Stok</Label>
                <Input type="number" min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>URL Gambar (opsional)</Label>
                <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="col-span-2 flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : (editId ? 'Update' : 'Tambah')}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-4">
        <Input placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Button variant="outline" onClick={fetchProducts}>Cari</Button>
      </div>

      {loading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map(p => (
            <Card key={p.id} className={!p.isActive ? 'opacity-50' : ''}>
              <CardContent className="p-3">
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-3xl mb-2">📦</div>
                <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                <p className="text-blue-600 font-bold text-sm">{formatRupiah(p.price)}</p>
                <p className="text-xs text-gray-500">Stok: {p.stock}</p>
                <div className="flex gap-1 mt-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => handleEdit(p)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500 text-xs" onClick={() => handleDelete(p.id)}>Hapus</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
