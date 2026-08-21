"use client"

import { useEffect } from "react"
import axios from "axios"
import { useAuthStore } from "@/stores/auth.store"
import type { AuthUser } from "@/types/user"

/**
 * Hydrates the client-side auth store on mount by asking our own
 * /api/auth/me Route Handler who the current session belongs to. This
 * covers full page loads / hard refreshes where Zustand's in-memory state
 * has been reset but the httpOnly session cookie is still valid.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)

  useEffect(() => {
    let cancelled = false

    axios
      .get<{ user: AuthUser }>("/api/auth/me")
      .then(({ data }) => {
        if (!cancelled) setUser(data.user)
      })
      .catch((err) => {
        if (!cancelled) {
          clearUser()
          // Backend JWT expired / session invalid → redirect to login
          if (err?.response?.status === 401 && window.location.pathname !== "/login") {
            window.location.replace("/login")
          }
        }
      })

    return () => {
      cancelled = true
    }
  }, [setUser, clearUser])

  return children
}
