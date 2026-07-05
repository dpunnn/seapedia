'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import {
  LayoutDashboard, Wallet, MapPin, ShoppingCart, Package, BarChart2,
  Store, Box, ClipboardList, TrendingUp, Search, Truck, History,
  AlertTriangle, Users, Ticket, Tag, Clock, LogOut, ChevronRight, ShoppingBag,
  Menu, X,
} from 'lucide-react';

interface NavItem { href: string; label: string; }

interface Props {
  role: string;
  navItems: NavItem[];
  children: React.ReactNode;
  navBadges?: Record<string, number>;
}

const ICON_MAP: Record<string, React.ElementType> = {
  '/dashboard/buyer': LayoutDashboard,
  '/dashboard/buyer/wallet': Wallet,
  '/dashboard/buyer/addresses': MapPin,
  '/dashboard/buyer/cart': ShoppingCart,
  '/dashboard/buyer/orders': Package,
  '/dashboard/buyer/report': BarChart2,
  '/dashboard/seller': LayoutDashboard,
  '/dashboard/seller/store': Store,
  '/dashboard/seller/products': Box,
  '/dashboard/seller/orders': ClipboardList,
  '/dashboard/seller/income': TrendingUp,
  '/dashboard/driver': LayoutDashboard,
  '/dashboard/driver/jobs': Search,
  '/dashboard/driver/active': Truck,
  '/dashboard/driver/history': History,
  '/dashboard/admin': LayoutDashboard,
  '/dashboard/admin/orders': ClipboardList,
  '/dashboard/admin/orders/overdue': AlertTriangle,
  '/dashboard/admin/users': Users,
  '/dashboard/admin/stores': Store,
  '/dashboard/admin/products': Box,
  '/dashboard/admin/deliveries': Truck,
  '/dashboard/admin/vouchers': Ticket,
  '/dashboard/admin/promos': Tag,
  '/dashboard/admin/time': Clock,
};

const ROLE_AVATAR_CONFIG: Record<string, { gradient: string; icon: React.ElementType; label: string }> = {
  BUYER:  { gradient: 'linear-gradient(135deg,#3B82F6,#1D4ED8)',  icon: ShoppingCart, label: 'Pembeli Aktif' },
  SELLER: { gradient: 'linear-gradient(135deg,#059669,#047857)',  icon: Store,        label: 'Penjual Aktif' },
  DRIVER: { gradient: 'linear-gradient(135deg,#059669,#34D399)',  icon: Truck,        label: 'Driver Aktif' },
  ADMIN:  { gradient: 'linear-gradient(135deg,#DC2626,#EF4444)',  icon: Users,        label: 'Admin' },
};

export default function DashboardLayout({ role, navItems, children, navBadges }: Props) {
  const { user, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.activeRole !== role)) {
      router.push('/login');
    }
  }, [user, isLoading, role, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    router.push('/');
  };

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F0F5FF' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    </div>
  );

  const username = user.email.split('@')[0];

  return (
    <div className="flex min-h-screen" style={{ background: '#F0F5FF' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col fixed lg:sticky top-0 h-screen overflow-y-auto z-50 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: 240,
          background: 'linear-gradient(180deg,#0F172A 0%,#1E293B 100%)',
        }}
      >
        {/* Logo */}
        <div className="p-5 pb-4">
          <div className="flex items-center justify-between mb-5">
            <Link href="/" className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="font-bold text-white text-base tracking-widest">SEAPEDIA</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden flex-shrink-0"
              style={{ color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer' }}
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User card */}
          {(() => {
            const avatarCfg = ROLE_AVATAR_CONFIG[role] ?? ROLE_AVATAR_CONFIG.BUYER;
            const AvatarIcon = avatarCfg.icon;
            return (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 16 }}
              >
                {/* Avatar */}
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: avatarCfg.gradient,
                  }}
                >
                  <AvatarIcon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white truncate" style={{ fontSize: 13, fontWeight: 700 }}>{username}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="inline-block rounded-full animate-pulse"
                      style={{ width: 6, height: 6, background: '#22C55E', flexShrink: 0 }}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{avatarCfg.label}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navItems.map(item => {
            const Icon = ICON_MAP[item.href] ?? ChevronRight;
            const isActive = pathname === item.href;
            const badge = navBadges?.[item.href];
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 transition-all"
                style={{
                  padding: '11px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </span>
                {badge != null && badge > 0 && (
                  <span
                    style={{
                      background: '#059669',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 20,
                      minWidth: 18,
                      textAlign: 'center',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 transition-colors"
            style={{
              padding: '11px 14px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto min-w-0">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 sticky top-0 z-30"
          style={{ background: '#F0F5FF', padding: '14px 16px', borderBottom: '1px solid #E2E8F0' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ color: '#0F172A', background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label="Buka menu sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold" style={{ fontSize: 14, letterSpacing: '0.05em', color: '#0F172A' }}>SEAPEDIA</span>
        </div>

        <div className="p-5 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
