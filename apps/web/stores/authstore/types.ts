export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthActions {
  setUser: (user: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  checkAuth: () => Promise<void>
}

export type AuthStore = AuthState & AuthActions