'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { Store } from 'lucide-react';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/seller', label: 'Dashboard' },
  { href: '/dashboard/seller/store', label: 'Toko Saya' },
  { href: '/dashboard/seller/products', label: 'Produk' },
  { href: '/dashboard/seller/orders', label: 'Pesanan' },
  { href: '/dashboard/seller/income', label: 'Pendapatan' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0',
  borderRadius: 11, fontSize: 14, outline: 'none', background: '#FAFAFA',
  boxSizing: 'border-box', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8,
};

export default function SellerStorePage() {
  const [store, setStore] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStore = () => {
    api.get('/seller/store').then(r => {
      setStore(r.data.data);
      setForm({ name: r.data.data.name, description: r.data.data.description || '' });
    }).catch(() => setStore(null)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStore(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nama toko wajib diisi'); return; }
    setSaving(true); setError(null);
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
      const msg = err.response?.data?.message || 'Gagal menyimpan';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="SELLER" navItems={NAV}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '96px 0' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #2563EB', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Profil Toko</h1>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>
          {store ? 'Buat atau perbarui profil tokomu' : 'Buat toko untuk mulai berjualan'}
        </p>
      </div>

      <div style={{ maxWidth: 620 }}>
        {/* Store Info Card (view mode) */}
        {store && !editing && (
          <div style={{ background: 'white', borderRadius: 22, padding: 32, border: '1.5px solid #F1F5F9', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'linear-gradient(135deg,#059669,#34D399)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Store size={26} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{store.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: '#64748B' }}>Penjual Aktif</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Deskripsi</div>
                <div style={{ fontSize: 14, color: '#374151' }}>{store.description || 'Belum ada deskripsi'}</div>
              </div>
              <div style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Total Produk</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{store._count?.products ?? 0} produk</div>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              style={{
                marginTop: 20, width: '100%', padding: 14,
                background: 'linear-gradient(135deg,#1D4ED8,#2563EB)',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 14, fontWeight: 800, cursor: 'pointer',
              }}
            >Edit Profil Toko</button>
          </div>
        )}

        {/* Form (create or edit) */}
        {(!store || editing) && (
          <div style={{ background: 'white', borderRadius: 22, padding: 32, border: '1.5px solid #F1F5F9' }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', margin: '0 0 24px' }}>
              {store ? 'Edit Profil Toko' : 'Buat Toko Baru'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>
                    Nama Toko <span style={{ color: '#94A3B8', fontWeight: 500 }}>(harus unik)</span>
                  </label>
                  <input
                    type="text" value={form.name} required minLength={3}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(null); }}
                    placeholder="cth: TechStore Jakarta"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Deskripsi Toko</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Ceritakan tentang tokomu..."
                    style={{ ...inputStyle, resize: 'none', height: 100 }}
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  marginTop: 16, background: '#FEF2F2', border: '1.5px solid #FCA5A5',
                  borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#DC2626', fontWeight: 600,
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                {editing && (
                  <button
                    type="button"
                    onClick={() => { setEditing(false); setError(null); }}
                    style={{
                      padding: '13px 24px', border: '1.5px solid #E2E8F0', borderRadius: 11,
                      background: 'white', fontSize: 14, fontWeight: 700, color: '#64748B', cursor: 'pointer',
                    }}
                  >Batal</button>
                )}
                <button
                  type="submit" disabled={saving}
                  style={{
                    flex: 1, padding: 14,
                    background: saving ? '#CBD5E1' : 'linear-gradient(135deg,#1D4ED8,#2563EB)',
                    color: 'white', border: 'none', borderRadius: 12,
                    fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >{saving ? 'Menyimpan...' : (store ? 'Simpan Perubahan' : 'Buat Toko')}</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
