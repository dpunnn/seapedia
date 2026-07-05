'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import { Package, X, Search } from 'lucide-react';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/seller', label: 'Dashboard' },
  { href: '/dashboard/seller/store', label: 'Toko Saya' },
  { href: '/dashboard/seller/products', label: 'Produk' },
  { href: '/dashboard/seller/orders', label: 'Pesanan' },
  { href: '/dashboard/seller/income', label: 'Pendapatan' },
];

const emptyForm = { name: '', description: '', price: '', stock: '', imageUrl: '' };

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0',
  borderRadius: 11, fontSize: 14, outline: 'none', background: '#FAFAFA',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8,
};

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

  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); };

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Kelola Produk
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>{total} produk terdaftar</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
          style={{
            padding: '10px 18px',
            background: showForm ? '#F1F5F9' : 'linear-gradient(135deg,#1D4ED8,#2563EB)',
            color: showForm ? '#64748B' : 'white',
            border: 'none', borderRadius: 12,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {showForm ? (
            <><X size={15} /> Tutup Form</>
          ) : (
            <>+ Tambah Produk</>
          )}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div style={{
          background: 'white', borderRadius: 22, padding: 32,
          border: '1.5px solid #F1F5F9', marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', margin: '0 0 22px' }}>
            {editId ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nama Produk</label>
                <input
                  type="text" value={form.name} required minLength={3}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nama produk" style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Harga (Rp)</label>
                  <input
                    type="number" min={1} value={form.price} required
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Harga (Rp)" style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Stok</label>
                  <input
                    type="number" min={0} value={form.stock} required
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="Stok" style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Deskripsi <span style={{ color: '#94A3B8', fontWeight: 500 }}>(opsional)</span></label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Deskripsi produk"
                  style={{ ...inputStyle, resize: 'none', height: 100 }}
                />
              </div>
              <div>
                <label style={labelStyle}>URL Gambar <span style={{ color: '#94A3B8', fontWeight: 500 }}>(opsional)</span></label>
                <input
                  type="text" value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..." style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                type="button" onClick={closeForm}
                style={{
                  padding: '13px 24px', border: '1.5px solid #E2E8F0', borderRadius: 11,
                  background: 'white', fontSize: 14, fontWeight: 700, color: '#64748B', cursor: 'pointer',
                }}
              >Batal</button>
              <button
                type="submit" disabled={saving}
                style={{
                  padding: '13px 28px',
                  background: saving ? '#CBD5E1' : 'linear-gradient(135deg,#1D4ED8,#2563EB)',
                  color: 'white', border: 'none', borderRadius: 11,
                  fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >{saving ? 'Menyimpan...' : (editId ? 'Update Produk' : 'Simpan Produk')}</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchProducts()}
            placeholder="Cari produk..."
            style={{ ...inputStyle, paddingLeft: 36, width: '100%' }}
          />
        </div>
        <button
          onClick={fetchProducts}
          style={{
            padding: '10px 18px', background: '#F1F5F9', border: 'none',
            borderRadius: 11, fontSize: 13, fontWeight: 700, color: '#374151', cursor: 'pointer',
          }}
        >Cari</button>
      </div>

      {/* Product Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 13 }}>Memuat...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #F1F5F9', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead style={{ background: '#F8FAFC' }}>
              <tr>
                {['Produk', 'Harga', 'Stok', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8',
                    padding: '14px 20px', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8', fontSize: 13 }}>
                    Belum ada produk. Klik "+ Tambah Produk" di kanan atas.
                  </td>
                </tr>
              ) : products.map(p => {
                const stockColor = p.stock === 0 ? '#DC2626' : p.stock <= 5 ? '#F59E0B' : '#16A34A';
                const stockBg = p.stock === 0 ? '#FEF2F2' : p.stock <= 5 ? '#FFFBEB' : '#F0FDF4';
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F8FAFC', opacity: p.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 46, height: 46, background: '#F1F5F9', borderRadius: 12,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', flexShrink: 0,
                        }}>
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Package size={20} color="#94A3B8" />}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{p.name}</div>
                          {p.description && (
                            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, maxWidth: 200,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                      {formatRupiah(p.price)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: stockColor, background: stockBg,
                        padding: '3px 9px', borderRadius: 7,
                      }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: p.isActive ? '#16A34A' : '#94A3B8',
                        background: p.isActive ? '#F0FDF4' : '#F1F5F9',
                        padding: '3px 10px', borderRadius: 100,
                      }}>{p.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleEdit(p)}
                          style={{
                            padding: '6px 12px', background: '#EFF6FF', color: '#2563EB',
                            border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          }}
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          style={{
                            padding: '6px 12px', background: '#FEF2F2', color: '#DC2626',
                            border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          }}
                        >Hapus</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
