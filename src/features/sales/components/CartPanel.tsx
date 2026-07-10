"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { CartItem } from "@/components/sales/CartItem"
import { CustomerSelector } from "./CustomerSelector"
import { formatCurrency } from "@/lib/format"
import { useCartStore, cartTotals } from "../stores/cart.store"

type CartPanelProps = {
  onCheckout: () => void
}

/** POS cart panel — line items, customer selection, discount, tax, totals, and checkout trigger. */
export function CartPanel({ onCheckout }: CartPanelProps) {
  const { items, customerId, removeItem, setQuantity, setDiscount, setCustomer, clearCart } = useCartStore()
  const totals = cartTotals(items)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="size-4" /> Cart
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <CustomerSelector value={customerId} onChange={setCustomer} allowWalkIn placeholder="Walk-in Customer" />

        <div className="flex flex-1 flex-col overflow-y-auto">
          {items.length === 0 ? (
            <EmptyState
              title="Cart is empty"
              description="Tap a product to add it to the cart."
              className="flex-1 justify-center border-none"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={(qty) => setQuantity(item.id, qty)}
                  onDiscountChange={(discount) => setDiscount(item.id, discount)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-1.5 border-t pt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatCurrency(totals.discountTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(totals.taxTotal)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-1.5 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totals.grandTotal)}</span>
            </div>

            <div className="mt-2 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearCart}>
                Clear
              </Button>
              <Button className="flex-1" onClick={onCheckout}>
                Charge {formatCurrency(totals.grandTotal)}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
