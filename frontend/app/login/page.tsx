'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';
import { decodeToken } from '@/lib/auth';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, setUser } = useAuthStore();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, roles } = res.data.data;
      login(token);
      toast.success('Berhasil masuk!');

      if (roles.length === 1) {
        const roleRes = await api.post('/auth/select-role', { role: roles[0] });
        login(roleRes.data.data.token);
        setUser(decodeToken(roleRes.data.data.token));
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
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/30 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">SEAPEDIA</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 leading-tight">Selamat Datang<br />Kembali!</h2>
          <p className="text-blue-100 text-base leading-relaxed max-w-xs">
            Masuk untuk melanjutkan belanja, kelola toko, atau cari pekerjaan pengiriman.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">SEAPEDIA</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Masuk ke Akun</h1>
          <p className="text-sm text-gray-500 mb-8">Masukkan email dan password Anda</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email" type="email" placeholder="email@example.com"
                  className="pl-9"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  className="pl-9 pr-9"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button" tabIndex={-1}
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full font-semibold" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Masuk
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">Daftar sekarang</Link>
          </p>

          <div className="mt-6 p-4 bg-white border border-gray-100 rounded-xl text-xs text-gray-500 shadow-sm">
            <p className="font-semibold text-gray-700 mb-2">Akun Demo:</p>
            <div className="space-y-1 font-mono">
              <p>admin@seapedia.com / Admin@123</p>
              <p>budi@seapedia.com / Buyer@123</p>
              <p>siti@seapedia.com / Seller@123</p>
              <p>doni@seapedia.com / Driver@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
