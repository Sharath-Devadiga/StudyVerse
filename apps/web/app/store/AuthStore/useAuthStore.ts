import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, User } from './types';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      logout: async () => {
        try {
          // Optional: Call backend logout endpoint to clear session/cookie
          await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        } catch (error) {
          console.error("Failed to logout from server:", error);
        } finally {
          // Clear user state regardless of server response
          set({ user: null, isAuthenticated: false });
          // Redirect to login page
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);