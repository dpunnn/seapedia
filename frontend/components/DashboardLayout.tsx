'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import {
  LayoutDashboard, Wallet, MapPin, ShoppingCart, Package, BarChart2,
  Store, Box, ClipboardList, TrendingUp, Search, Truck, History,
  AlertTriangle, Users, Ticket, Tag, Clock, LogOut, ChevronRight,
} from 'lucide-react';

interface NavItem { href: string; label: string; }

interface Props {
  role: string;
  navItems: NavItem[];
  children: React.ReactNode;
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

const ROLE_CONFIG: Record<string, { label: string; badge: string; accent: string; activeBg: string; activeText: string; activeBorder: string }> = {
  BUYER:  { label: 'Pembeli',   badge: 'bg-blue-100 text-blue-700',   accent: 'text-blue-600',   activeBg: 'bg-blue-50',   activeText: 'text-blue-700',   activeBorder: 'border-blue-500' },
  SELLER: { label: 'Penjual',   badge: 'bg-green-100 text-green-700', accent: 'text-green-600',  activeBg: 'bg-green-50',  activeText: 'text-green-700',  activeBorder: 'border-green-500' },
  DRIVER: { label: 'Pengemudi', badge: 'bg-orange-100 text-orange-700', accent: 'text-orange-600', activeBg: 'bg-orange-50', activeText: 'text-orange-700', activeBorder: 'border-orange-500' },
  ADMIN:  { label: 'Admin',     badge: 'bg-red-100 text-red-700',     accent: 'text-red-600',    activeBg: 'bg-red-50',    activeText: 'text-red-700',    activeBorder: 'border-red-500' },
};

export default function DashboardLayout({ role, navItems, children }: Props) {
  const { user, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.activeRole !== role)) {
      router.push('/login');
    }
  }, [user, isLoading, role, router]);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    router.push('/');
  };

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Memuat...</p>
      </div>
    </div>
  );

  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.BUYER;
  const initials = user.email.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-primary text-base tracking-tight">SEAPEDIA</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className={`text-sm font-bold ${cfg.accent}`}>{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.email.split('@')[0]}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${cfg.badge}`}>
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = ICON_MAP[item.href] ?? ChevronRight;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-l-[3px] ${
                  isActive
                    ? `${cfg.activeBg} ${cfg.activeText} ${cfg.activeBorder}`
                    : 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? cfg.activeText : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link
            href="/select-role"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
            Ganti Peran
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50/60">
        <div className="p-6 min-h-full">{children}</div>
      </div>
    </div>
  );
}
