import { create } from "zustand"
import type { SalesFilters } from "../types"

type SalesStoreState = {
  filters: SalesFilters
  setFilter: <K extends keyof SalesFilters>(key: K, value: SalesFilters[K]) => void
  resetFilters: () => void
}

export const useSalesStore = create<SalesStoreState>()((set) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: {} }),
}))
