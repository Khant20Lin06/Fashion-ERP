"use client"

import { useEffect } from "react"
import { ShoppingCart, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CartItem } from "@/components/sales/CartItem"
import { formatCurrency } from "@/lib/format"
import { useAuthStore } from "@/stores/auth.store"
import { hasPermission } from "@/types/user"
import { useSalesPriceLists } from "../hooks/useSales"
import { CustomerSelector } from "./CustomerSelector"
import { cartTotals, useCartStore } from "../stores/cart.store"
import { buildCartItemsRegionClassName, buildPosScrollablePaneClassName } from "./pos-layout.classes"

type CartPanelProps = {
  onCheckout: () => void
}

/** POS cart panel -- line items, customer selection, promotion code, discount, tax, totals, and checkout trigger. */
export function CartPanel({ onCheckout }: CartPanelProps) {
  const {
    items,
    customerId,
    priceListId,
    promotionCode,
    removeItem,
    setQuantity,
    setDiscount,
    setCustomer,
    setPriceListId,
    setPromotionCode,
    clearCart,
  } =
    useCartStore()
  const { data: priceLists = [] } = useSalesPriceLists()
  const totals = cartTotals(items)
  const user = useAuthStore((state) => state.user)
  // Real backend requirement: POST /sales additionally requires
  // sales.discount.apply whenever promotionCode is set or any item has a
  // non-zero discountAmount (see SalesController.create). ACTION_MAP in
  // lib/backend-auth.ts maps the real "apply" action word onto the
  // frontend's "approve" bucket, so a user actually holding
  // sales.discount.apply ends up with module "sales" + action "approve"
  // here. Hiding the promotion-code input and per-item discount controls
  // for users without it avoids letting them fill in values that would
  // just 403 at submit.
  const canApplyDiscount = hasPermission(user, "sales", "approve")
  const requiresExplicitPriceList = priceLists.length !== 1
  const isPriceListMissing = requiresExplicitPriceList && !priceListId

  useEffect(() => {
    if (priceLists.length === 1 && priceListId !== priceLists[0].id) {
      setPriceListId(priceLists[0].id)
      return
    }
    if (priceListId && !priceLists.some((entry) => entry.id === priceListId)) {
      setPriceListId(priceLists.length === 1 ? priceLists[0].id : undefined)
    }
  }, [priceListId, priceLists, setPriceListId])

  return (
    <Card className={buildPosScrollablePaneClassName()}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="size-4" /> Cart
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="space-y-1.5">
          <Label>Sales Price List</Label>
          <Select value={priceListId} onValueChange={setPriceListId} disabled={items.length > 0 || priceLists.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={priceLists.length === 0 ? "No active price list" : "Select a price list"} />
            </SelectTrigger>
            <SelectContent>
              {priceLists.map((priceList) => (
                <SelectItem key={priceList.id} value={priceList.id}>
                  {priceList.name} ({priceList.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {items.length > 0 ? (
            <p className="text-xs text-muted-foreground">Clear the cart before switching to another sales price list.</p>
          ) : null}
          {isPriceListMissing ? (
            <p className="text-xs text-destructive">Select a sales price list before adding products to this cart.</p>
          ) : null}
          {priceLists.length === 0 ? (
            <p className="text-xs text-destructive">No active sales price list is available for this company.</p>
          ) : null}
        </div>

        <CustomerSelector value={customerId} onChange={setCustomer} allowWalkIn placeholder="Walk-in Customer" />

        {canApplyDiscount && (
          <div className="space-y-2 rounded-lg border border-dashed border-border/70 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="size-4" />
              <span>Promotion Code</span>
            </div>
            <Input
              value={promotionCode ?? ""}
              onChange={(event) => setPromotionCode(event.target.value)}
              placeholder="Enter promo code"
            />
          </div>
        )}

        <div className={buildCartItemsRegionClassName()}>
          {items.length === 0 ? (
            <EmptyState
              title="Cart is empty"
              description="Tap a product to add it to the cart."
              className="flex min-h-full justify-center border-none"
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
                  canDiscount={canApplyDiscount}
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
              <Button className="flex-1" onClick={onCheckout} disabled={isPriceListMissing}>
                Charge {formatCurrency(totals.grandTotal)}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
