import { create } from "zustand"
import type { ProductFilters } from "../types"

type ProductStoreState = {
  filters: ProductFilters
  setFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void
  resetFilters: () => void
  selectedColors: string[]
  selectedSizes: string[]
  toggleColor: (color: string) => void
  toggleSize: (size: string) => void
  resetVariantBuilder: () => void
}

export const useProductStore = create<ProductStoreState>()((set) => ({
  filters: {},
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: {} }),

  selectedColors: [],
  selectedSizes: [],
  toggleColor: (color) =>
    set((state) => ({
      selectedColors: state.selectedColors.includes(color)
        ? state.selectedColors.filter((c) => c !== color)
        : [...state.selectedColors, color],
    })),
  toggleSize: (size) =>
    set((state) => ({
      selectedSizes: state.selectedSizes.includes(size)
        ? state.selectedSizes.filter((s) => s !== size)
        : [...state.selectedSizes, size],
    })),
  resetVariantBuilder: () => set({ selectedColors: [], selectedSizes: [] }),
}))
