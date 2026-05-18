import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('cfm_token', token);
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (updates) => set(s => ({ user: { ...s.user, ...updates } })),

      logout: () => {
        localStorage.removeItem('cfm_token');
        localStorage.removeItem('cfm_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name:    'cfm_auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
);

export default useAuthStore;
