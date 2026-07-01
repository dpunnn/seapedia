'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Mail, Lock, User, Eye, EyeOff, ShoppingCart, Store, Truck, Check, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

const ROLES = [
  {
    value: 'BUYER',
    label: 'Pembeli',
    desc: 'Jelajahi dan beli produk dari penjual',
    icon: ShoppingCart,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    activeBg: 'bg-blue-50',
  },
  {
    value: 'SELLER',
    label: 'Penjual',
    desc: 'Buka toko dan jual produk Anda',
    icon: Store,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-500',
    activeBg: 'bg-green-50',
  },
  {
    value: 'DRIVER',
    label: 'Pengemudi',
    desc: 'Antar pesanan dan dapatkan penghasilan',
    icon: Truck,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-500',
    activeBg: 'bg-orange-50',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]           = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [selectedRoles, setRoles] = useState<string[]>(['BUYER']);
  const [loading, setLoading]     = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [showPw2, setShowPw2]     = useState(false);

  const toggleRole = (role: string) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Password tidak cocok'); return; }
    if (selectedRoles.length === 0) { toast.error('Pilih minimal satu peran'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        roles: selectedRoles,
      });
      toast.success('Registrasi berhasil! Silakan masuk.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">Buat Akun Baru</h1>
          <p className="text-sm text-gray-500 text-center mb-7">Mulai perjalanan belanja Anda</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="username" placeholder="username_anda"
                  className="pl-9"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required minLength={3}
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password" type={showPw ? 'text' : 'password'} placeholder="Minimal 8 karakter"
                  className="pl-9 pr-9"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required minLength={8}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword" type={showPw2 ? 'text' : 'password'} placeholder="Ulangi password"
                  className="pl-9 pr-9"
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  required
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPw2(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Saya bergabung sebagai (bisa lebih dari satu)</Label>
              <div className="grid gap-2">
                {ROLES.map(role => {
                  const Icon = role.icon;
                  const selected = selectedRoles.includes(role.value);
                  return (
                    <button
                      key={role.value} type="button"
                      onClick={() => toggleRole(role.value)}
                      className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        selected
                          ? `${role.border} ${role.activeBg}`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? role.bg : 'bg-gray-50'}`}>
                        <Icon className={`w-5 h-5 ${selected ? role.color : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${selected ? 'text-gray-900' : 'text-gray-700'}`}>{role.label}</p>
                        <p className="text-xs text-gray-500">{role.desc}</p>
                      </div>
                      {selected && (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${role.color.replace('text-', 'bg-').replace('600', '100')}`}>
                          <Check className={`w-3 h-3 ${role.color}`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" className="w-full font-semibold mt-2" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Mendaftar...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Daftar Sekarang
                </span>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">Masuk sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
