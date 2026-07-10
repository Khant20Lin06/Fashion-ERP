import { create } from "zustand"
import type { AuthUser } from "@/types/user"

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser) => void
  clearUser: () => void
  setLoading: (loading: boolean) => void
}

/**
 * Client-side auth state, hydrated from the server on app load
 * (see providers/AuthProvider.tsx). This store is a read model for the UI
 * (showing the current user, gating nav items) — it is never the source of
 * truth for authorization, which is always re-verified server-side.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  clearUser: () => set({ user: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))
