
export interface User {
  id: string;
  googleId?: string | null;
  email: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  createdAt: string;
  departmentId?: string | null;
  universityId?: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}