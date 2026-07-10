import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark" | "system"
type Density = "comfortable" | "compact"

export type NotificationPreferences = {
  emailAlerts: boolean
  approvalRequests: boolean
  lowStockAlerts: boolean
  soundEnabled: boolean
}

type SettingsState = {
  theme: Theme
  density: Density
  language: string
  dateFormat: string
  notificationPreferences: NotificationPreferences
  setTheme: (theme: Theme) => void
  setDensity: (density: Density) => void
  setLanguage: (language: string) => void
  setDateFormat: (dateFormat: string) => void
  setNotificationPreference: <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => void
}

/** User-level app preferences, persisted locally. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      density: "comfortable",
      language: "en",
      dateFormat: "DD/MM/YYYY",
      notificationPreferences: {
        emailAlerts: true,
        approvalRequests: true,
        lowStockAlerts: true,
        soundEnabled: false,
      },
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      setLanguage: (language) => set({ language }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setNotificationPreference: (key, value) =>
        set((state) => ({
          notificationPreferences: { ...state.notificationPreferences, [key]: value },
        })),
    }),
    { name: "erp-settings" }
  )
)
