import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "../types"

const TAX_RATE = 0.08

type CartStoreState = {
  items: CartItem[]
  customerId: string | undefined
  addItem: (item: Omit<CartItem, "quantity" | "discountPercent"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  setDiscount: (id: string, discountPercent: number) => void
  setCustomer: (customerId: string | undefined) => void
  clearCart: () => void
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      items: [],
      customerId: undefined,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: Math.min(i.quantity + (item.quantity ?? 1), i.availableStock) } : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(item.quantity ?? 1, item.availableStock), discountPercent: 0 },
            ],
          }
        }),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.availableStock)) } : i
          ),
        })),

      setDiscount: (id, discountPercent) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, discountPercent: Math.max(0, Math.min(discountPercent, 100)) } : i
          ),
        })),

      setCustomer: (customerId) => set({ customerId }),

      clearCart: () => set({ items: [], customerId: undefined }),
    }),
    {
      name: "erp-pos-cart",
    }
  )
)

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discountTotal = items.reduce((sum, i) => sum + (i.price * i.quantity * i.discountPercent) / 100, 0)
  const taxable = subtotal - discountTotal
  const taxTotal = taxable * TAX_RATE
  const grandTotal = taxable + taxTotal
  return { subtotal, discountTotal, taxTotal, grandTotal }
}

/** Convenience hook so components don't need to import `cartTotals` separately. */
export function useCartTotals() {
  const items = useCartStore((state) => state.items)
  return cartTotals(items)
}
