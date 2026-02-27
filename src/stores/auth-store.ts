import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserInfo {
  email: string
  name: string
  picture: string
}

interface AuthState {
  accessToken: string | null
  expiresAt: number | null
  user: UserInfo | null
  authReady: boolean
  setAuth: (token: string, expiresIn: number) => void
  setUser: (user: UserInfo) => void
  setAuthReady: (ready: boolean) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      expiresAt: null,
      user: null,
      authReady: false,
      setAuth: (token, expiresIn) =>
        set({ accessToken: token, expiresAt: Date.now() + expiresIn * 1000, authReady: true }),
      setUser: (user) => set({ user }),
      setAuthReady: (ready) => set({ authReady: ready }),
      logout: () => set({ accessToken: null, expiresAt: null, user: null }),
      isAuthenticated: () => {
        const { accessToken, expiresAt } = get()
        return !!accessToken && !!expiresAt && Date.now() < expiresAt
      },
    }),
    {
      name: 'tsink-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
    }
  )
)
