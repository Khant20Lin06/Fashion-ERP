"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsSection } from "@/components/admin/SettingsSection"
import { useSettingsStore } from "@/stores/settings.store"

const languageOptions = [
  { value: "en", label: "English" },
  { value: "my", label: "Myanmar (Burmese)" },
  { value: "th", label: "Thai" },
  { value: "zh", label: "Chinese" },
]

const dateFormatOptions = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]

/** Language & Region — personal overrides for language and date format. */
export function LanguageRegionSection() {
  const language = useSettingsStore((s) => s.language)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const dateFormat = useSettingsStore((s) => s.dateFormat)
  const setDateFormat = useSettingsStore((s) => s.setDateFormat)

  return (
    <SettingsSection title="Language & Region" description="Personal display preferences for this account.">
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Language</p>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">Date Format</p>
        <Select value={dateFormat} onValueChange={setDateFormat}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateFormatOptions.map((format) => (
              <SelectItem key={format} value={format}>
                {format}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </SettingsSection>
  )
}
