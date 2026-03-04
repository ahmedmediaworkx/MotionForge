import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setAccessToken: (accessToken) => set({ accessToken }),
      
      setLoading: (isLoading) => set({ isLoading }),

      login: (user, accessToken) => {
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      hasPlan: (plan) => {
        const { user } = get();
        if (!user) return false;
        
        const planHierarchy = { free: 0, pro: 1, agency: 2 };
        return planHierarchy[user.plan] >= planHierarchy[plan];
      },
    }),
    {
      name: 'motionforge-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);