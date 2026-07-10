import { create } from "zustand"
import type { InventoryFilters } from "../types"

type InventoryStoreState = {
  filters: InventoryFilters
  setFilter: <K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => void
  resetFilters: () => void
  selectedWarehouseId: string | undefined
  setSelectedWarehouseId: (id: string | undefined) => void
}

export const useInventoryStore = create<InventoryStoreState>()((set) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: {} }),

  selectedWarehouseId: undefined,
  setSelectedWarehouseId: (id) => set({ selectedWarehouseId: id }),
}))
