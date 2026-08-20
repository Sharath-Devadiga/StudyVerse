import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState } from "./types";
import { logout as logoutApi } from "../../../lib/api/auth";
import { disconnectSocket } from "../../../lib/socket";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      rooms: [],
      activeRoomId: null,
      connectionStatus: "disconnected",

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },

      setRooms: (rooms) => {
        set({ rooms });
      },

      setActiveRoomId: (roomId) => {
        set({ activeRoomId: roomId });
      },

      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },

      reset: () => {
        disconnectSocket();
        set({
          user: null,
          isAuthenticated: false,
          rooms: [],
          activeRoomId: null,
          connectionStatus: "disconnected",
        });
      },

      logout: async () => {
        try {
          await logoutApi();
        } catch {
          // Clear local state even if server logout fails
        } finally {
          disconnectSocket();
          set({
            user: null,
            isAuthenticated: false,
            rooms: [],
            activeRoomId: null,
            connectionStatus: "disconnected",
          });
          window.location.href = "/login";
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        activeRoomId: state.activeRoomId,
      }),
    }
  )
);
