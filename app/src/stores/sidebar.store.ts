import { create } from "zustand"
import { persist } from "zustand/middleware"

type SidebarState = {
  isCollapsed: boolean
  isMobileOpen: boolean
  openMenuKeys: string[]
  toggleCollapsed: () => void
  setMobileOpen: (open: boolean) => void
  toggleMenu: (key: string) => void
}

/**
 * Sidebar UI state. Collapsed state persists across sessions (user preference);
 * mobile-open and expanded-menu state are session-only.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      isMobileOpen: false,
      openMenuKeys: [],
      toggleCollapsed: () => set({ isCollapsed: !get().isCollapsed }),
      setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
      toggleMenu: (key) => {
        const keys = get().openMenuKeys
        set({
          openMenuKeys: keys.includes(key)
            ? keys.filter((k) => k !== key)
            : [...keys, key],
        })
      },
    }),
    {
      name: "erp-sidebar-state",
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
)
