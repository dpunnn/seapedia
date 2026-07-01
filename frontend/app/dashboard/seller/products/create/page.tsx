'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Package } from 'lucide-react';
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

export default function CreateProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 3) {
      toast.error('Nama produk minimal 3 karakter');
      return;
    }
    if (parseFloat(form.price) <= 0) {
      toast.error('Harga harus lebih dari 0');
      return;
    }
    setSaving(true);
    try {
      await api.post('/seller/products', {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        imageUrl: form.imageUrl.trim() || undefined,
      });
      toast.success('Produk berhasil ditambahkan');
      router.push('/dashboard/seller/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan produk');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="SELLER" navItems={NAV}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            width: 38, height: 38, borderRadius: 10, border: '1.5px solid #E2E8F0',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} color="#64748B" />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Tambah Produk Baru
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>
            Isi detail produk yang akan dijual
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div style={{
          background: 'white', borderRadius: 20, padding: 32,
          border: '1.5px solid #F1F5F9',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>
                  Nama Produk <span style={{ color: '#EF4444', fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  required
                  minLength={3}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nama produk (minimal 3 karakter)"
                  style={inputStyle}
                />
              </div>

              {/* Price & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>
                    Harga <span style={{ color: '#EF4444', fontWeight: 700 }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 13, fontWeight: 700, color: '#64748B', pointerEvents: 'none',
                    }}>Rp</span>
                    <input
                      type="number"
                      min={1}
                      step="any"
                      value={form.price}
                      required
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="0"
                      style={{ ...inputStyle, paddingLeft: 36 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>
                    Stok <span style={{ color: '#EF4444', fontWeight: 700 }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.stock}
                    required
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="Jumlah stok"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>
                  Deskripsi <span style={{ color: '#94A3B8', fontWeight: 500 }}>(opsional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Deskripsi produk..."
                  style={{ ...inputStyle, resize: 'none', height: 100 }}
                />
              </div>

              {/* Image URL */}
              <div>
                <label style={labelStyle}>
                  URL Gambar <span style={{ color: '#94A3B8', fontWeight: 500 }}>(opsional)</span>
                </label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  style={inputStyle}
                />

                {/* Preview thumbnail */}
                {form.imageUrl.trim() && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: 12, background: '#F1F5F9',
                      overflow: 'hidden', border: '1.5px solid #E2E8F0', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src={form.imageUrl.trim()}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          (e.currentTarget.parentElement as HTMLElement).style.display = 'flex';
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: '#64748B' }}>Preview gambar produk</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  padding: '13px 24px', border: '1.5px solid #E2E8F0', borderRadius: 11,
                  background: 'white', fontSize: 14, fontWeight: 700, color: '#64748B',
                  cursor: 'pointer',
                }}
              >Batal</button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1, padding: '13px 28px',
                  background: saving ? '#CBD5E1' : 'linear-gradient(135deg,#1D4ED8,#2563EB)',
                  color: 'white', border: 'none', borderRadius: 11,
                  fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Package size={16} />
                    Simpan Produk
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
}
