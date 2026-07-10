"use client"

import { LogOut, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsSection } from "@/components/admin/SettingsSection"
import { useLogout } from "@/features/auth/hooks/use-logout"
import { useAuthStore } from "@/stores/auth.store"

/** Active Session — this device's session, with a sign-out action. */
export function ActiveSessionSection() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <SettingsSection title="Session" description="You're signed in on this device.">
      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="flex items-center gap-2.5">
          <Monitor className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">This device</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut /> Sign Out
        </Button>
      </div>
    </SettingsSection>
  )
}
