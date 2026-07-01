'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Store, Truck, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { decodeToken } from '@/lib/auth';
import api from '@/lib/api';

const ROLE_INFO: Record<string, {
  label: string;
  desc: string;
  route: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}> = {
  BUYER:  {
    label: 'Pembeli',
    desc: 'Jelajahi dan beli produk dari toko terpercaya',
    route: '/dashboard/buyer',
    icon: ShoppingCart,
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  SELLER: {
    label: 'Penjual',
    desc: 'Kelola toko, produk, dan pesanan Anda',
    route: '/dashboard/seller',
    icon: Store,
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
  },
  DRIVER: {
    label: 'Driver',
    desc: 'Ambil dan antar pesanan, dapatkan penghasilan',
    route: '/dashboard/driver',
    icon: Truck,
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
  },
  ADMIN: {
    label: 'Admin',
    desc: 'Kelola seluruh platform SEAPEDIA',
    route: '/dashboard/admin',
    icon: Settings,
    iconBg: '#FFF1F2',
    iconColor: '#E11D48',
  },
};

export default function SelectRolePage() {
  const { user, login, setUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const handleSelectRole = async (role: string) => {
    try {
      const res = await api.post('/auth/select-role', { role });
      const token = res.data.data.token;
      login(token);
      setUser(decodeToken(token));
      toast.success(`Masuk sebagai ${ROLE_INFO[role]?.label}`);
      router.push(ROLE_INFO[role]?.route || '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memilih peran');
    }
  };

  if (!user) return null;

  const displayName = user.email?.split('@')[0] || 'Pengguna';

  return (
    <div style={{
      minHeight: '100vh', background: '#F0F5FF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        background: 'white', borderRadius: '22px', padding: '28px',
        maxWidth: '420px', width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px', lineHeight: 1 }}>👋</div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>
            Halo, {displayName}!
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            Pilih peran untuk sesi ini
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {user.roles.map((role) => {
            const info = ROLE_INFO[role];
            if (!info) return null;
            const Icon = info.icon;
            return (
              <button
                key={role}
                onClick={() => handleSelectRole(role)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  border: '2px solid #E2E8F0', borderRadius: '14px', padding: '18px',
                  background: 'white', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s', width: '100%',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#2563EB';
                  (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0';
                  (e.currentTarget as HTMLButtonElement).style.background = 'white';
                }}
              >
                {/* Icon box */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: info.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: '22px', height: '22px', color: info.iconColor }} />
                </div>

                {/* Label + desc */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                    {info.label}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                    {info.desc}
                  </p>
                </div>

                {/* Arrow */}
                <span style={{ fontSize: '18px', color: '#CBD5E1', flexShrink: 0 }}>→</span>
              </button>
            );
          })}
        </div>

        {/* Logout link */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '20px' }}>
          Bukan akun Anda?{' '}
          <button
            onClick={async () => {
              const { useAuthStore } = await import('@/store/auth.store');
              useAuthStore.getState().logout();
              router.push('/login');
            }}
            style={{ color: '#2563EB', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
          >
            Keluar
          </button>
        </p>
      </div>
    </div>
  );
}
