'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ShoppingCart, Store, Truck, Settings, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { decodeToken } from '@/lib/auth';
import api from '@/lib/api';

const ROLE_INFO: Record<string, {
  label: string;
  desc: string;
  route: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  hoverBorder: string;
}> = {
  BUYER:  { label: 'Pembeli',   desc: 'Jelajahi dan beli produk dari toko terpercaya', route: '/dashboard/buyer',  icon: ShoppingCart, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   hoverBorder: 'hover:border-blue-400' },
  SELLER: { label: 'Penjual',   desc: 'Kelola toko, produk, dan pesanan Anda',         route: '/dashboard/seller', icon: Store,        color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  hoverBorder: 'hover:border-green-400' },
  DRIVER: { label: 'Pengemudi', desc: 'Ambil dan antar pesanan, dapatkan penghasilan', route: '/dashboard/driver', icon: Truck,        color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', hoverBorder: 'hover:border-orange-400' },
  ADMIN:  { label: 'Admin',     desc: 'Kelola seluruh platform SEAPEDIA',              route: '/dashboard/admin',  icon: Settings,     color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    hoverBorder: 'hover:border-red-400' },
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">SEAPEDIA</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold text-primary">{user.email.charAt(0).toUpperCase()}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Masuk sebagai Apa?</h1>
            <p className="text-sm text-gray-500 mt-1">
              Halo, <span className="font-medium text-gray-700">{user.email.split('@')[0]}</span>. Pilih peran untuk sesi ini.
            </p>
          </div>

          {/* Role Cards */}
          <div className="space-y-3">
            {user.roles.map((role) => {
              const info = ROLE_INFO[role];
              if (!info) return null;
              const Icon = info.icon;
              return (
                <button
                  key={role}
                  onClick={() => handleSelectRole(role)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all group ${info.border} ${info.hoverBorder} hover:shadow-md`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${info.bg} group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-6 h-6 ${info.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{info.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Bukan akun Anda?{' '}
          <button
            onClick={async () => {
              const { useAuthStore } = await import('@/store/auth.store');
              useAuthStore.getState().logout();
              router.push('/login');
            }}
            className="text-primary hover:underline"
          >
            Keluar
          </button>
        </p>
      </div>
    </div>
  );
}
