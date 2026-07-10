import { create } from "zustand"
import type { HrFilters } from "../types"

type HrStoreState = {
  filters: HrFilters
  setFilter: <K extends keyof HrFilters>(key: K, value: HrFilters[K]) => void
  resetFilters: () => void

  selectedEmployeeId: string | undefined
  setSelectedEmployeeId: (id: string | undefined) => void
}

export const useHrStore = create<HrStoreState>()((set) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: {} }),

  selectedEmployeeId: undefined,
  setSelectedEmployeeId: (id) => set({ selectedEmployeeId: id }),
}))
