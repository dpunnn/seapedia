'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ShoppingBag, ShoppingCart, Bell, Search, LayoutDashboard, LogOut,
  ChevronDown, Store, Truck, Crown,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ROLE_LABELS: Record<string, string> = { BUYER: 'Pembeli', SELLER: 'Penjual', DRIVER: 'Pengemudi', ADMIN: 'Admin' };
const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/dashboard/admin', SELLER: '/dashboard/seller', BUYER: '/dashboard/buyer', DRIVER: '/dashboard/driver',
};
const ROLE_COLORS: Record<string, string> = {
  BUYER: '#2563EB', SELLER: '#16A34A', DRIVER: '#EA580C', ADMIN: '#DC2626',
};
const ROLE_BG: Record<string, string> = {
  BUYER: '#EFF6FF', SELLER: '#F0FDF4', DRIVER: '#FFF7ED', ADMIN: '#FEF2F2',
};

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

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
      useAuthStore.getState().setUser(decodeToken(token));
      router.push(ROLE_ROUTES[role] || '/');
    } catch {}
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : '/products');
  };

  const dashboardRoute = user?.activeRole ? ROLE_ROUTES[user.activeRole] : null;
  const roleColor = user?.activeRole ? ROLE_COLORS[user.activeRole] : '#2563EB';
  const roleBg   = user?.activeRole ? ROLE_BG[user.activeRole]   : '#EFF6FF';
  const userName  = user?.email?.split('@')[0] ?? '';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'white', height: 64, display: 'flex', alignItems: 'center',
      padding: '0 32px', gap: 16,
      boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,.12)' : '0 1px 3px rgba(0,0,0,.06)',
      transition: 'box-shadow .3s',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0, textDecoration: 'none' }}>
        <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#1E40AF,#3B82F6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(37,99,235,.3)', flexShrink: 0 }}>
          <ShoppingBag style={{ width: 20, height: 20, color: 'white' }} />
        </div>
        <span style={{ fontSize: 21, fontWeight: 900, color: '#1D4ED8', letterSpacing: -.5, whiteSpace: 'nowrap' }}>SEAPEDIA</span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 8, flexShrink: 0 }}>
        <NavLink href="/products?category=katalog">Katalog</NavLink>
        <NavLink href="/products">Produk</NavLink>
        <NavLink href="/reviews">Ulasan</NavLink>
        <NavLink href="/#seller">Jual Disini</NavLink>
        {user?.activeRole === 'SELLER' && <NavLink href="/dashboard/seller"><Store style={{ width: 13, height: 13, display: 'inline', marginRight: 4 }} />Toko</NavLink>}
        {user?.activeRole === 'DRIVER' && <NavLink href="/dashboard/driver"><Truck style={{ width: 13, height: 13, display: 'inline', marginRight: 4 }} />Driver</NavLink>}
        {(user?.roles?.includes('ADMIN') || user?.activeRole === 'ADMIN') && (
          <NavLink href="/dashboard/admin" redHover>
            <Crown style={{ width: 13, height: 13, display: 'inline', marginRight: 4, color: '#DC2626' }} />
            <span style={{ color: '#DC2626' }}>Admin</span>
          </NavLink>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400, margin: '0 16px', position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#94A3B8', pointerEvents: 'none' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari produk, toko, brand..."
          style={{ width: '100%', padding: '10px 14px 10px 40px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 13, outline: 'none', background: '#F8FAFC', transition: 'all .2s', boxSizing: 'border-box' }}
          onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
        />
      </form>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
        {/* Bell */}
        <button style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell style={{ width: 17, height: 17, color: '#64748B' }} />
          <span style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, background: '#DC2626', borderRadius: '50%', border: '2px solid white', animation: 'pulseDot 2s ease-in-out infinite' }} />
        </button>

        {/* Cart */}
        <Link href={user?.activeRole === 'BUYER' ? '/dashboard/buyer/cart' : '/products'}
          style={{ position: 'relative', width: 38, height: 38, borderRadius: 10, border: '1.5px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          <ShoppingCart style={{ width: 17, height: 17, color: '#64748B' }} />
        </Link>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: '#E2E8F0', margin: '0 2px', flexShrink: 0 }} />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger style={{ background: roleBg, color: roleColor, padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', outline: 'none' }}>
              👋 {userName}
              {user.activeRole && (
                <span style={{ fontSize: 11, background: roleColor, color: 'white', borderRadius: 6, padding: '2px 7px', fontWeight: 700 }}>
                  {ROLE_LABELS[user.activeRole]}
                </span>
              )}
              <ChevronDown style={{ width: 13, height: 13, opacity: .6 }} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" style={{ width: 200 }}>
              {dashboardRoute && (
                <>
                  <DropdownMenuItem onClick={() => router.push(dashboardRoute)}>
                    <LayoutDashboard style={{ width: 14, height: 14, marginRight: 8, color: '#94A3B8' }} />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {user.roles.filter(r => r !== user.activeRole).map(role => (
                <DropdownMenuItem key={role} onClick={() => handleRoleSwitch(role)}>
                  Beralih ke {ROLE_LABELS[role]}
                </DropdownMenuItem>
              ))}
              {!user.activeRole && user.roles.map(role => (
                <DropdownMenuItem key={role} onClick={() => handleRoleSwitch(role)}>
                  Masuk sebagai {ROLE_LABELS[role]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} style={{ color: '#DC2626' }}>
                <LogOut style={{ width: 14, height: 14, marginRight: 8 }} />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Link href="/login" style={{ padding: '9px 18px', borderRadius: 10, border: '1.5px solid #2563EB', background: 'white', color: '#2563EB', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Masuk
            </Link>
            <Link href="/register" style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', color: 'white', fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(37,99,235,.3)' }}>
              Daftar Gratis
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children, redHover }: { href: string; children: React.ReactNode; redHover?: boolean }) {
  return (
    <Link href={href} style={{ padding: '8px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#64748B', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', transition: 'all .2s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.color = redHover ? '#DC2626' : '#2563EB'; el.style.background = redHover ? '#FEF2F2' : '#EFF6FF'; }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.color = '#64748B'; el.style.background = 'transparent'; }}>
      {children}
    </Link>
  );
}
