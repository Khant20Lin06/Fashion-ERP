"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useAuthStore } from "@/stores/auth.store"

export function useLogout() {
  const router = useRouter()
  const clearUser = useAuthStore((s) => s.clearUser)

  return useMutation({
    mutationFn: async () => {
      await axios.post("/api/auth/logout")
    },
    onSuccess: () => {
      clearUser()
      router.push("/login")
      router.refresh()
    },
  })
}
