"use client"

import { Bell } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "@/components/admin/SettingsSection"

/** Notification channel preferences. The real backend NotificationChannel
 * enum has only one member — IN_APP — email/SMS/push are explicitly
 * unimplemented, and there is no per-user/per-company notification
 * preferences endpoint at all (BACKEND GAP, confirmed via source read).
 * In-App is always on by design; shown disabled rather than fabricating a
 * settings form with no backend to persist to. */
export function NotificationSettings() {
  return (
    <SettingsSection title="Notification Channels" description="In-app notifications are always enabled. Email, SMS, and push channels are not yet supported by the backend.">
      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="flex items-center gap-2.5">
          <Bell className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">In App</span>
        </div>
        <Switch checked disabled />
      </div>
    </SettingsSection>
  )
}
