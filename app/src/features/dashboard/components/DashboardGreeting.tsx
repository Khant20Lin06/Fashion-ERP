"use client"

import { useAuthStore } from "@/stores/auth.store"

function getFirstName(fullName: string | undefined) {
  if (!fullName) return "there"
  return fullName.split(" ")[0]
}

export function DashboardGreeting() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back, {getFirstName(user?.name)}
      </h1>
      <p className="text-sm text-muted-foreground">
        Here&apos;s what&apos;s happening across your business today.
      </p>
    </div>
  )
}
