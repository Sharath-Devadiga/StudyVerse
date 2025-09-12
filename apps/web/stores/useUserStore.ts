import {create} from 'zustand';
import { User } from '../app/types';
import { getUserProfile } from '../app/lib/api'; // We will update api.ts later

interface UserState {
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set: any) => ({
  user: null,
  isLoading: true,
  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const userData = await getUserProfile();
      set({ user: userData, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch user", error);
      set({ user: null, isLoading: false });
    }
  },
}));
