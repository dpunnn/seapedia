'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { Loader2, Store, ArrowLeft } from 'lucide-react';
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

export default function CreateStorePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNameChange = (value: string) => {
    setForm(f => ({ ...f, name: value }));
    setNameError(null);

    // Debounce uniqueness check
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(async () => {
        try {
          await api.get('/seller/store/check-name', { params: { name: value.trim() } });
          setNameError(null);
        } catch (err: any) {
          const msg = err.response?.data?.message;
          if (msg) setNameError(msg);
        }
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 3) {
      setNameError('Nama toko minimal 3 karakter');
      return;
    }
    if (nameError) return;

    setSaving(true);
    try {
      await api.post('/seller/store', {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      toast.success('Toko berhasil dibuat!');
      router.push('/dashboard/seller');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal membuat toko';
      setNameError(msg);
      toast.error(msg);
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
            Buat Toko Baru
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>
            Daftarkan toko untuk mulai berjualan
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 560 }}>
        {/* Icon banner */}
        <div style={{
          background: 'linear-gradient(135deg,#059669,#34D399)',
          borderRadius: 20, padding: '28px 32px',
          display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24,
        }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Store size={28} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'white' }}>Mulai Berjualan</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>
              Buat toko dan mulai jual produk ke pembeli
            </div>
          </div>
        </div>

        {/* Form card */}
        <div style={{
          background: 'white', borderRadius: 20, padding: 32,
          border: '1.5px solid #F1F5F9',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Store name */}
              <div>
                <label style={labelStyle}>
                  Nama Toko <span style={{ color: '#EF4444', fontWeight: 700 }}>*</span>
                  <span style={{ color: '#94A3B8', fontWeight: 500, marginLeft: 6 }}>(harus unik)</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  required
                  minLength={3}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="cth: TechStore Jakarta"
                  style={{
                    ...inputStyle,
                    borderColor: nameError ? '#FCA5A5' : '#E2E8F0',
                  }}
                />
                {nameError && (
                  <div style={{
                    marginTop: 8, fontSize: 12, color: '#DC2626', fontWeight: 600,
                  }}>{nameError}</div>
                )}
                {!nameError && form.name.trim().length >= 3 && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>
                    Nama tersedia
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>
                  Deskripsi Toko <span style={{ color: '#94A3B8', fontWeight: 500 }}>(opsional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ceritakan tentang tokomu..."
                  style={{ ...inputStyle, resize: 'none', height: 110 }}
                />
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
                disabled={saving || !!nameError}
                style={{
                  flex: 1, padding: '13px 28px',
                  background: (saving || !!nameError) ? '#CBD5E1' : 'linear-gradient(135deg,#1D4ED8,#2563EB)',
                  color: 'white', border: 'none', borderRadius: 11,
                  fontSize: 14, fontWeight: 800,
                  cursor: (saving || !!nameError) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Membuat Toko...
                  </>
                ) : (
                  <>
                    <Store size={16} />
                    Buat Toko
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
