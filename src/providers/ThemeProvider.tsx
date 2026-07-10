"use client"

import { useEffect } from "react"
import { useSettingsStore } from "@/stores/settings.store"

/**
 * Applies the user's theme preference (light/dark/system) to <html>.
 * Backed by Zustand (stores/settings.store.ts) rather than a third-party
 * theme library, keeping the dependency surface aligned with the stack.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    function applyTheme() {
      const isDark = theme === "dark" || (theme === "system" && media.matches)
      root.classList.toggle("dark", isDark)
    }

    applyTheme()

    if (theme === "system") {
      media.addEventListener("change", applyTheme)
      return () => media.removeEventListener("change", applyTheme)
    }
  }, [theme])

  return children
}
