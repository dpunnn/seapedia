'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { decodeToken } from '@/lib/auth';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, setUser } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, roles } = res.data.data;
      login(token);
      toast.success('Berhasil masuk!');

      // If single role, auto-select role
      if (roles.length === 1) {
        const roleRes = await api.post('/auth/select-role', { role: roles[0] });
        login(roleRes.data.data.token);
        const user = decodeToken(roleRes.data.data.token);
        setUser(user);
        const routes: Record<string, string> = {
          ADMIN: '/dashboard/admin', SELLER: '/dashboard/seller',
          BUYER: '/dashboard/buyer', DRIVER: '/dashboard/driver',
        };
        router.push(routes[roles[0]] || '/');
      } else {
        router.push('/select-role');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Masuk ke SEAPEDIA</CardTitle>
          <CardDescription>Masukkan email dan password Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email" type="email" placeholder="email@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">Daftar sekarang</Link>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-1">Demo accounts:</p>
            <p>admin@seapedia.com / Admin@123</p>
            <p>budi@seapedia.com / Buyer@123</p>
            <p>siti@seapedia.com / Seller@123</p>
            <p>doni@seapedia.com / Driver@123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
