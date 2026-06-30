'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard/admin', label: 'Dashboard' },
  { href: '/dashboard/admin/orders', label: 'Pesanan' },
  { href: '/dashboard/admin/users', label: 'Pengguna' },
  { href: '/dashboard/admin/vouchers', label: 'Voucher' },
  { href: '/dashboard/admin/promos', label: 'Promo' },
  { href: '/dashboard/admin/time', label: 'Simulasi Waktu' },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  SELLER: 'bg-blue-100 text-blue-700',
  BUYER: 'bg-green-100 text-green-700',
  DRIVER: 'bg-orange-100 text-orange-700',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.data?.users || [])).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="ADMIN" navItems={NAV}>
      <h1 className="text-2xl font-bold mb-6">Pengguna ({users.length})</h1>

      {loading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="space-y-2">
          {users.map(u => (
            <Card key={u.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{u.username}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  <p className="text-xs text-gray-400">Bergabung: {new Date(u.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end max-w-xs">
                  {u.roles.map((r: any) => (
                    <span key={r.role} className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[r.role] || 'bg-gray-100 text-gray-700'}`}>
                      {r.role}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
