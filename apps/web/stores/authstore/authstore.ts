import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthStore, User } from '../authstore/types'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user: User) => 
        set({ user, isAuthenticated: true, isLoading: false }),

      logout: () => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        }).finally(() => {
          set({ user: null, isAuthenticated: false, isLoading: false })
        })
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
            credentials: 'include'
          })
          
          if (response.ok) {
            const user = await response.json()
            set({ user, isAuthenticated: true, isLoading: false })
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)