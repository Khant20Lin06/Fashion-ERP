import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PurchaseFilters } from "../types"
import type { PurchaseOrderItemValues } from "../schemas/purchase.schema"

type DraftPurchaseOrder = {
  supplierId?: string
  items: PurchaseOrderItemValues[]
}

type PurchaseStoreState = {
  filters: PurchaseFilters
  setFilter: <K extends keyof PurchaseFilters>(key: K, value: PurchaseFilters[K]) => void
  resetFilters: () => void

  draftOrder: DraftPurchaseOrder
  setDraftSupplier: (supplierId: string) => void
  setDraftItems: (items: PurchaseOrderItemValues[]) => void
  clearDraftOrder: () => void
}

export const usePurchaseStore = create<PurchaseStoreState>()(
  persist(
    (set) => ({
      filters: {},
      setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
      resetFilters: () => set({ filters: {} }),

      draftOrder: { items: [] },
      setDraftSupplier: (supplierId) => set((state) => ({ draftOrder: { ...state.draftOrder, supplierId } })),
      setDraftItems: (items) => set((state) => ({ draftOrder: { ...state.draftOrder, items } })),
      clearDraftOrder: () => set({ draftOrder: { items: [] } }),
    }),
    {
      name: "erp-purchase-draft",
      partialize: (state) => ({ draftOrder: state.draftOrder }),
    }
  )
)
