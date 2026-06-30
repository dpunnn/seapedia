'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

interface NavItem { href: string; label: string; }

interface Props {
  role: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

export default function DashboardLayout({ role, navItems, children }: Props) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.activeRole !== role)) {
      router.push('/login');
    }
  }, [user, isLoading, role, router]);

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Memuat...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-white border-r flex-shrink-0">
        <div className="p-4 border-b">
          <p className="font-semibold text-sm text-gray-800">{user.email}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
        <nav className="p-2">
          {navItems.map(item => (
            <Link
              key={item.href} href={item.href}
              className="flex items-center px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors text-gray-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  );
}
