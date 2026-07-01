'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
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
  BUYER:  'bg-blue-100 text-blue-700',
  SELLER: 'bg-green-100 text-green-700',
  DRIVER: 'bg-orange-100 text-orange-700',
  ADMIN:  'bg-red-100 text-red-700',
};

const ROLE_AVATAR: Record<string, string> = {
  BUYER:  'bg-blue-100 text-blue-700',
  SELLER: 'bg-green-100 text-green-700',
  DRIVER: 'bg-orange-100 text-orange-700',
  ADMIN:  'bg-red-100 text-red-700',
};

const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/dashboard/admin',
  SELLER: '/dashboard/seller',
  BUYER: '/dashboard/buyer',
  DRIVER: '/dashboard/driver',
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
      router.push(ROLE_ROUTES[role] || '/');
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">SEAPEDIA</span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/products" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors">
            Produk
          </Link>
          <Link href="/reviews" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors">
            Ulasan
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`text-xs font-bold ${user.activeRole ? ROLE_AVATAR[user.activeRole] : 'bg-gray-100 text-gray-600'}`}>
                      {user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-800 leading-tight">{user.email.split('@')[0]}</span>
                    {user.activeRole && (
                      <span className={`text-xs px-1.5 py-0 rounded-full font-medium leading-5 ${ROLE_COLORS[user.activeRole]}`}>
                        {ROLE_LABELS[user.activeRole]}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {user.activeRole && (
                  <>
                    <DropdownMenuItem onClick={() => router.push(ROLE_ROUTES[user.activeRole!] || '/')}>
                      <LayoutDashboard className="w-4 h-4 mr-2 text-gray-400" />
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
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-700 font-medium">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="font-medium shadow-sm">Daftar</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
