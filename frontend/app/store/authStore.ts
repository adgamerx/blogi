import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  username: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => {
        // Also store token in localStorage for axios interceptor
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
        }
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        // Clear localStorage token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
); 