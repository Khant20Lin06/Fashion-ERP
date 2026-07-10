import { create } from "zustand"
import { persist } from "zustand/middleware"

type SearchState = {
  isOpen: boolean
  recentSearches: string[]
  setOpen: (open: boolean) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
}

const MAX_RECENT = 5

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      recentSearches: [],
      setOpen: (isOpen) => set({ isOpen }),
      addRecentSearch: (query) => {
        const trimmed = query.trim()
        if (!trimmed) return
        const existing = get().recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())
        set({ recentSearches: [trimmed, ...existing].slice(0, MAX_RECENT) })
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "erp-recent-searches",
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
)
