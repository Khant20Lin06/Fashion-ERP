import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark" | "system"
type Density = "comfortable" | "compact"

type SettingsState = {
  theme: Theme
  density: Density
  setTheme: (theme: Theme) => void
  setDensity: (density: Density) => void
}

/** User-level app preferences, persisted locally. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      density: "comfortable",
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
    }),
    { name: "erp-settings" }
  )
)
