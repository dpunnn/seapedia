import { create } from 'zustand';
import { getUser, setToken, removeToken, JwtUser } from '@/lib/auth';

interface AuthState {
  user: JwtUser | null;
  isLoading: boolean;
  setUser: (user: JwtUser | null) => void;
  login: (token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  login: (token) => {
    setToken(token);
    const user = getUser();
    set({ user });
  },
  logout: () => {
    removeToken();
    set({ user: null });
  },
  init: () => {
    const user = getUser();
    set({ user, isLoading: false });
  },
}));
