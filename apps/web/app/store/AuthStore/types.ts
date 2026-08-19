import type { User, Room, ConnectionStatus } from "../../../lib/types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  rooms: Room[];
  activeRoomId: string | null;
  connectionStatus: ConnectionStatus;

  setUser: (user: User | null) => void;
  setHydrated: (hydrated: boolean) => void;
  setRooms: (rooms: Room[]) => void;
  setActiveRoomId: (roomId: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  logout: () => Promise<void>;
  reset: () => void;
}
