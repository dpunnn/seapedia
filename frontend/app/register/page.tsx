'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';

const ROLES = [
  { value: 'BUYER', label: 'Pembeli', desc: 'Beli produk dari penjual' },
  { value: 'SELLER', label: 'Penjual', desc: 'Jual produk di platform' },
  { value: 'DRIVER', label: 'Pengemudi', desc: 'Antar pesanan dan dapatkan penghasilan' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['BUYER']);
  const [loading, setLoading] = useState(false);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }
    if (selectedRoles.length === 0) {
      toast.error('Pilih minimal satu peran');
      return;
    }
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Daftar SEAPEDIA</CardTitle>
          <CardDescription>Buat akun baru untuk mulai berbelanja</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username" placeholder="username_anda"
                value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required minLength={3}
              />
            </div>
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
                id="password" type="password" placeholder="Minimal 8 karakter"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required minLength={8}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword" type="password" placeholder="Ulangi password"
                value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Pilih Peran (bisa lebih dari satu)</Label>
              <div className="grid gap-2">
                {ROLES.map(role => (
                  <button
                    key={role.value} type="button"
                    onClick={() => toggleRole(role.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      selectedRoles.includes(role.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-sm">{role.label}</p>
                    <p className="text-xs text-gray-500">{role.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Mendaftar...' : 'Daftar'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">Masuk sekarang</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
