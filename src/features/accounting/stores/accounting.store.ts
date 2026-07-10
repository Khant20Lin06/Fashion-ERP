import { create } from "zustand"
import type { AccountingFilters } from "../types"

type AccountingStoreState = {
  filters: AccountingFilters
  setFilter: <K extends keyof AccountingFilters>(key: K, value: AccountingFilters[K]) => void
  resetFilters: () => void
}

export const useAccountingStore = create<AccountingStoreState>()((set) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: {} }),
}))
