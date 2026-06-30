import Cookies from 'js-cookie';

export interface JwtUser {
  userId: string;
  email: string;
  roles: string[];
  activeRole?: string;
}

export function getToken(): string | undefined {
  return Cookies.get('token');
}

export function setToken(token: string) {
  Cookies.set('token', token, { expires: 7, sameSite: 'lax' });
}

export function removeToken() {
  Cookies.remove('token');
}

export function decodeToken(token: string): JwtUser | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function getUser(): JwtUser | null {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}
