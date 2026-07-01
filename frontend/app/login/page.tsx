'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, KeyRound, Eye, EyeOff, ShoppingCart, Store, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { decodeToken } from '@/lib/auth';
import api from '@/lib/api';

const DEMO_ACCOUNTS = [
  { label: 'Admin',    username: 'admin',  password: 'demo' },
  { label: 'Pembeli',  username: 'buyer1', password: 'demo' },
  { label: 'Penjual',  username: 'seller1',password: 'demo' },
  { label: 'Driver',   username: 'driver1',password: 'demo' },
];

const ROLES = [
  { value: 'BUYER',  label: 'Pembeli', desc: 'Jelajahi & beli produk',     icon: ShoppingCart, iconBg: '#EFF6FF', iconColor: '#2563EB' },
  { value: 'SELLER', label: 'Penjual', desc: 'Buka toko & jual produk',    icon: Store,        iconBg: '#F0FDF4', iconColor: '#16A34A' },
  { value: 'DRIVER', label: 'Driver',  desc: 'Antar pesanan & penghasilan', icon: Truck,        iconBg: '#FFF7ED', iconColor: '#EA580C' },
];

function LoginPageInner() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { login, setUser } = useAuthStore();

  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab]   = useState<'login' | 'register'>(initialMode);
  const [loginForm, setLoginForm]   = useState({ username: '', password: '' });
  const [regForm, setRegForm]       = useState({ fullname: '', username: '', password: '' });
  const [selectedRoles, setRoles]   = useState<string[]>(['BUYER']);
  const [loading, setLoading]       = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [showRegPw, setShowRegPw]   = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    const mode = searchParams.get('mode');
    setActiveTab(mode === 'register' ? 'register' : 'login');
  }, [searchParams]);

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setError('');
    const url = tab === 'register' ? '/login?mode=register' : '/login';
    router.replace(url);
  };

  const fillDemo = (username: string, password: string) => {
    setLoginForm({ username, password });
    if (activeTab !== 'login') switchTab('login');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', loginForm);
      const { token, roles } = res.data.data;
      login(token);
      toast.success('Berhasil masuk!');
      if (roles.length === 1) {
        const roleRes = await api.post('/auth/select-role', { role: roles[0] });
        login(roleRes.data.data.token);
        setUser(decodeToken(roleRes.data.data.token));
        const routes: Record<string, string> = {
          ADMIN: '/dashboard/admin', SELLER: '/dashboard/seller',
          BUYER: '/dashboard/buyer', DRIVER: '/dashboard/driver',
        };
        router.push(routes[roles[0]] || '/');
      } else {
        router.push('/select-role');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Username atau password salah');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (selectedRoles.length === 0) { setError('Pilih minimal satu peran'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: regForm.username,
        fullname: regForm.fullname,
        password: regForm.password,
        roles: selectedRoles,
      });
      toast.success('Registrasi berhasil! Silakan masuk.');
      switchTab('login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F0F5FF', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '64px', background: 'white',
        borderBottom: '1px solid #E2E8F0',
      }}>
        <span style={{ fontWeight: 800, fontSize: '20px', color: '#1D4ED8', letterSpacing: '-0.5px' }}>
          SEAPEDIA
        </span>
        <span style={{ fontSize: '14px', color: '#64748B' }}>
          {activeTab === 'login' ? (
            <>Belum punya akun?{' '}
              <button onClick={() => switchTab('register')}
                style={{ color: '#1D4ED8', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                Daftar sekarang
              </button>
            </>
          ) : (
            <>Sudah punya akun?{' '}
              <button onClick={() => switchTab('login')}
                style={{ color: '#1D4ED8', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                Masuk
              </button>
            </>
          )}
        </span>
      </nav>

      {/* Body */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)', padding: '40px 20px', gap: '60px',
      }}>
        {/* Left side */}
        <div style={{ maxWidth: '480px', flex: '1 1 400px' }}>
          {/* Online badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#DCFCE7', borderRadius: '100px', padding: '6px 14px',
            marginBottom: '24px',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A',
              display: 'inline-block', animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#15803D' }}>
              1.247 orang online sekarang
            </span>
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1.15, color: '#0F172A', marginBottom: '16px' }}>
            Selamat datang kembali! 👋
          </h1>
          <p style={{ fontSize: '16px', color: '#64748B', lineHeight: 1.75, marginBottom: '32px', maxWidth: '380px' }}>
            Platform marketplace terpercaya untuk nelayan, penjual, dan pembeli produk laut Indonesia.
          </p>

          {/* Demo accounts card */}
          <div style={{
            background: 'white', borderRadius: '18px', padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '12px' }}>
              Coba dengan akun demo:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.username}
                  onClick={() => fillDemo(acc.username, acc.password)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '10px',
                    padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#BFDBFE';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#F1F5F9';
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{acc.label}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94A3B8' }}>
                    {acc.username} / {acc.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right form card */}
        <div style={{
          background: 'white', borderRadius: '28px', padding: '44px 40px',
          maxWidth: '440px', width: '100%', flexShrink: 0,
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        }}>
          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: '#F1F5F9', borderRadius: '14px',
            padding: '5px', marginBottom: '28px',
          }}>
            {(['login', 'register'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTab === tab ? 'white' : 'transparent',
                  color: activeTab === tab ? '#1D4ED8' : '#94A3B8',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                Masuk ke akun
              </h2>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>
                Gunakan username dan password kamu
              </p>

              {error && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px',
                  padding: '10px 14px', marginBottom: '16px', color: '#DC2626', fontSize: '13px',
                }}>
                  {error}
                </div>
              )}

              {/* Username */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
                  <input
                    type="text" placeholder="username kamu"
                    value={loginForm.username}
                    onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                    required
                    style={{
                      width: '100%', padding: '13px 14px 13px 42px', boxSizing: 'border-box',
                      border: '1.5px solid #E2E8F0', borderRadius: '12px', background: '#FAFAFA',
                      fontSize: '14px', color: '#1E293B', outline: 'none',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#2563EB')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
                  <input
                    type={showPw ? 'text' : 'password'} placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    required
                    style={{
                      width: '100%', padding: '13px 42px 13px 42px', boxSizing: 'border-box',
                      border: '1.5px solid #E2E8F0', borderRadius: '12px', background: '#FAFAFA',
                      fontSize: '14px', color: '#1E293B', outline: 'none',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#2563EB')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                  />
                  <button
                    type="button" tabIndex={-1}
                    onClick={() => setShowPw(v => !v)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0,
                    }}
                  >
                    {showPw ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                  color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px',
                  fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,.35)', marginBottom: '16px',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Memproses...
                  </span>
                ) : 'Masuk'}
              </button>

              <div style={{
                background: '#EFF6FF', borderRadius: '10px', padding: '10px 14px',
                fontSize: '11px', color: '#1D4ED8', lineHeight: 1.5,
              }}>
                💡 Password default semua akun demo: <strong>demo</strong>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister}>
              <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                Buat akun baru
              </h2>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '24px' }}>
                Mulai perjalanan belanja Anda
              </p>

              {error && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px',
                  padding: '10px 14px', marginBottom: '16px', color: '#DC2626', fontSize: '13px',
                }}>
                  {error}
                </div>
              )}

              {/* Nama Lengkap */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Nama Lengkap
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
                  <input
                    type="text" placeholder="Nama lengkap kamu"
                    value={regForm.fullname}
                    onChange={e => setRegForm(f => ({ ...f, fullname: e.target.value }))}
                    required
                    style={{
                      width: '100%', padding: '13px 14px 13px 42px', boxSizing: 'border-box',
                      border: '1.5px solid #E2E8F0', borderRadius: '12px', background: '#FAFAFA',
                      fontSize: '14px', color: '#1E293B', outline: 'none',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#2563EB')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                  />
                </div>
              </div>

              {/* Username */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
                  <input
                    type="text" placeholder="username_kamu"
                    value={regForm.username}
                    onChange={e => setRegForm(f => ({ ...f, username: e.target.value }))}
                    required minLength={3}
                    style={{
                      width: '100%', padding: '13px 14px 13px 42px', boxSizing: 'border-box',
                      border: '1.5px solid #E2E8F0', borderRadius: '12px', background: '#FAFAFA',
                      fontSize: '14px', color: '#1E293B', outline: 'none',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#2563EB')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
                  <input
                    type={showRegPw ? 'text' : 'password'} placeholder="Minimal 6 karakter"
                    value={regForm.password}
                    onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                    required minLength={6}
                    style={{
                      width: '100%', padding: '13px 42px 13px 42px', boxSizing: 'border-box',
                      border: '1.5px solid #E2E8F0', borderRadius: '12px', background: '#FAFAFA',
                      fontSize: '14px', color: '#1E293B', outline: 'none',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#2563EB')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                  />
                  <button
                    type="button" tabIndex={-1}
                    onClick={() => setShowRegPw(v => !v)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0,
                    }}
                  >
                    {showRegPw ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                  </button>
                </div>
              </div>

              {/* Role picker */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  Saya bergabung sebagai
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {ROLES.map(role => {
                    const Icon = role.icon;
                    const active = selectedRoles.includes(role.value);
                    return (
                      <button
                        key={role.value} type="button"
                        onClick={() => toggleRole(role.value)}
                        style={{
                          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: '6px', padding: '12px 8px',
                          border: active ? '2px solid #2563EB' : '2px solid #E2E8F0',
                          borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s',
                          background: active ? '#EFF6FF' : 'white',
                        }}
                      >
                        <Icon style={{ width: '20px', height: '20px', color: active ? '#2563EB' : '#94A3B8' }} />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: active ? '#1D4ED8' : '#64748B' }}>
                          {role.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
                  Bisa pilih lebih dari satu peran
                </p>
              </div>

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1D4ED8, #2563EB)',
                  color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px',
                  fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,.35)',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Mendaftar...
                  </span>
                ) : 'Daftar Sekarang'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F0F5FF' }} />}>
      <LoginPageInner />
    </Suspense>
  );
}
