"use client"

import { Bell, CheckCheck, Mail, Package } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "@/components/admin/SettingsSection"
import { useSettingsStore, type NotificationPreferences } from "@/stores/settings.store"

const preferenceConfig: { key: keyof NotificationPreferences; label: string; icon: typeof Bell }[] = [
  { key: "emailAlerts", label: "Email Alerts", icon: Mail },
  { key: "approvalRequests", label: "Approval Requests", icon: CheckCheck },
  { key: "lowStockAlerts", label: "Low Stock Alerts", icon: Package },
  { key: "soundEnabled", label: "Notification Sound", icon: Bell },
]

/** Notification Preferences — per-user toggles for the alerts this app already sends. */
export function NotificationPreferencesSection() {
  const preferences = useSettingsStore((s) => s.notificationPreferences)
  const setPreference = useSettingsStore((s) => s.setNotificationPreference)

  return (
    <SettingsSection title="Notification Preferences" description="Choose which alerts you want to receive.">
      {preferenceConfig.map(({ key, label, icon: Icon }) => (
        <div key={key} className="flex items-center justify-between rounded-md border p-3">
          <div className="flex items-center gap-2.5">
            <Icon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <Switch checked={preferences[key]} onCheckedChange={(checked) => setPreference(key, checked)} />
        </div>
      ))}
    </SettingsSection>
  )
}
