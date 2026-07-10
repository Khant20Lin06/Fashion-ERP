"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useAuthStore } from "@/stores/auth.store"
import type { LoginFormValues } from "../schemas/login.schema"
import type { AuthUser } from "@/types/user"

type LoginRouteResponse = { user: AuthUser }

/**
 * Submits credentials to our own /api/auth/login Route Handler (not the
 * external backend directly), because only a Route Handler running on the
 * server can set the httpOnly session cookie. On success, hydrates the
 * client-side auth store and redirects to the dashboard.
 */
export function useLogin() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { data } = await axios.post<LoginRouteResponse>("/api/auth/login", values)
      return data
    },
    onSuccess: (data) => {
      setUser(data.user)
      router.push("/dashboard")
      router.refresh()
    },
  })
}
