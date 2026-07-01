'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?mode=register');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#F0F5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #BFDBFE', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
