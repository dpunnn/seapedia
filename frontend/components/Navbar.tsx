'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import api from '@/lib/api';

const ROLE_LABELS: Record<string, string> = {
  BUYER: 'Pembeli',
  SELLER: 'Penjual',
  DRIVER: 'Pengemudi',
  ADMIN: 'Admin',
};

const ROLE_COLORS: Record<string, string> = {
  BUYER: 'bg-blue-100 text-blue-700',
  SELLER: 'bg-green-100 text-green-700',
  DRIVER: 'bg-orange-100 text-orange-700',
  ADMIN: 'bg-red-100 text-red-700',
};

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    router.push('/');
  };

  const handleRoleSwitch = async (role: string) => {
    try {
      const res = await api.post('/auth/select-role', { role });
      const token = res.data.data.token;
      const { setToken, decodeToken } = await import('@/lib/auth');
      setToken(token);
      const { useAuthStore } = await import('@/store/auth.store');
      useAuthStore.getState().setUser(decodeToken(token));
      const routes: Record<string, string> = {
        ADMIN: '/dashboard/admin',
        SELLER: '/dashboard/seller',
        BUYER: '/dashboard/buyer',
        DRIVER: '/dashboard/driver',
      };
      router.push(routes[role] || '/');
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          SEAPEDIA
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/products" className="hover:text-blue-600 transition-colors">Produk</Link>
          <Link href="/reviews" className="hover:text-blue-600 transition-colors">Ulasan</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm">{user.email.split('@')[0]}</span>
                {user.activeRole && (
                  <span className={`hidden md:inline text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.activeRole]}`}>
                    {ROLE_LABELS[user.activeRole]}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user.activeRole && (
                  <>
                    <DropdownMenuItem onClick={() => {
                      const routes: Record<string, string> = {
                        ADMIN: '/dashboard/admin', SELLER: '/dashboard/seller',
                        BUYER: '/dashboard/buyer', DRIVER: '/dashboard/driver',
                      };
                      router.push(routes[user.activeRole!] || '/');
                    }}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {user.roles.filter(r => r !== user.activeRole).map((role) => (
                  <DropdownMenuItem key={role} onClick={() => handleRoleSwitch(role)}>
                    Beralih ke {ROLE_LABELS[role]}
                  </DropdownMenuItem>
                ))}
                {!user.activeRole && user.roles.map((role) => (
                  <DropdownMenuItem key={role} onClick={() => handleRoleSwitch(role)}>
                    Masuk sebagai {ROLE_LABELS[role]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className="inline-flex items-center justify-center rounded-md h-8 px-3 text-sm font-medium hover:bg-gray-100">Masuk</Link>
              <Link href="/register" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-8 px-3 text-sm font-medium">Daftar</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
