"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsSection } from "@/components/admin/SettingsSection"
import { cn } from "@/lib/utils"
import { useSettingsStore } from "@/stores/settings.store"

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

const densityOptions = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
] as const

/** Appearance section — theme (light/dark/system) and layout density. */
export function AppearanceSection() {
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const density = useSettingsStore((s) => s.density)
  const setDensity = useSettingsStore((s) => s.setDensity)

  return (
    <SettingsSection title="Appearance" description="Customize how the app looks on this device.">
      <div className="space-y-2">
        <p className="text-sm font-medium">Theme</p>
        <div className="flex flex-wrap gap-2">
          {themeOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={theme === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(option.value)}
              className={cn("gap-1.5")}
            >
              <option.icon className="size-4" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Density</p>
        <div className="flex flex-wrap gap-2">
          {densityOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={density === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setDensity(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </SettingsSection>
  )
}
