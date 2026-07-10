"use client"

import { useState } from "react"
import { Bell, Mail, MessageSquare, Smartphone } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "@/components/admin/SettingsSection"
import type { NotificationChannel } from "../types"

const channelConfig: { channel: NotificationChannel; label: string; icon: typeof Bell }[] = [
  { channel: "in_app", label: "In App", icon: Bell },
  { channel: "email", label: "Email", icon: Mail },
  { channel: "sms", label: "SMS", icon: MessageSquare },
  { channel: "push", label: "Push Notification", icon: Smartphone },
]

/** Notification channel preferences — In App / Email / SMS / Push toggles. */
export function NotificationSettings() {
  const [enabled, setEnabled] = useState<Record<NotificationChannel, boolean>>({
    in_app: true,
    email: true,
    sms: false,
    push: true,
  })

  return (
    <SettingsSection title="Notification Channels" description="Choose how you want to receive notifications.">
      {channelConfig.map(({ channel, label, icon: Icon }) => (
        <div key={channel} className="flex items-center justify-between rounded-md border p-3">
          <div className="flex items-center gap-2.5">
            <Icon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{label}</span>
          </div>
          <Switch
            checked={enabled[channel]}
            onCheckedChange={(checked) => setEnabled((prev) => ({ ...prev, [channel]: checked }))}
          />
        </div>
      ))}
    </SettingsSection>
  )
}
