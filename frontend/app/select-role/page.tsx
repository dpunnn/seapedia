'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { decodeToken } from '@/lib/auth';
import api from '@/lib/api';

const ROLE_INFO: Record<string, { label: string; icon: string; desc: string; route: string }> = {
  BUYER: { label: 'Pembeli', icon: '🛒', desc: 'Jelajahi dan beli produk', route: '/dashboard/buyer' },
  SELLER: { label: 'Penjual', icon: '🏪', desc: 'Kelola toko dan produk', route: '/dashboard/seller' },
  DRIVER: { label: 'Pengemudi', icon: '🚗', desc: 'Ambil dan antar pesanan', route: '/dashboard/driver' },
  ADMIN: { label: 'Admin', icon: '⚙️', desc: 'Kelola platform', route: '/dashboard/admin' },
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Pilih Peran</h1>
          <p className="text-gray-600 mt-1">Anda ingin masuk sebagai?</p>
        </div>
        <div className="grid gap-3">
          {user.roles.map((role) => {
            const info = ROLE_INFO[role];
            if (!info) return null;
            return (
              <Card
                key={role}
                className="cursor-pointer hover:shadow-md hover:border-blue-400 transition-all"
                onClick={() => handleSelectRole(role)}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <span className="text-3xl">{info.icon}</span>
                  <div>
                    <p className="font-semibold">{info.label}</p>
                    <p className="text-sm text-gray-500">{info.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
