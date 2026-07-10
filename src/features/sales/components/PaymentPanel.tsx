"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaymentMethodSelector } from "@/components/sales/PaymentMethod"
import { formatCurrency } from "@/lib/format"
import { useCartStore, cartTotals } from "../stores/cart.store"
import { useCheckout } from "../hooks/useInvoice"
import type { PaymentMethod } from "../types"

type PaymentPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Payment dialog — Cart -> Customer -> Discount -> Payment -> Invoice -> Stock Update. */
export function PaymentPanel({ open, onOpenChange }: PaymentPanelProps) {
  const router = useRouter()
  const { items, customerId, clearCart } = useCartStore()
  const checkout = useCheckout()
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [amountTendered, setAmountTendered] = useState(0)

  const totals = cartTotals(items)
  const change = Math.max(0, amountTendered - totals.grandTotal)
  const canSubmit = method !== "cash" || amountTendered >= totals.grandTotal

  function handleConfirm() {
    checkout.mutate(
      { customerId, items, paymentMethod: method, amountTendered: method === "cash" ? amountTendered : totals.grandTotal },
      {
        onSuccess: (invoice) => {
          clearCart()
          onOpenChange(false)
          router.push(`/dashboard/sales/invoices/${invoice.id}`)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/40 p-4 text-center">
            <p className="text-xs text-muted-foreground">Amount Due</p>
            <p className="text-3xl font-semibold tracking-tight">{formatCurrency(totals.grandTotal)}</p>
          </div>

          <div className="space-y-1.5">
            <Label>Payment Method</Label>
            <PaymentMethodSelector value={method} onChange={setMethod} />
          </div>

          {method === "cash" && (
            <div className="space-y-1.5">
              <Label htmlFor="amount-tendered">Amount Tendered</Label>
              <Input
                id="amount-tendered"
                type="number"
                min={0}
                step="0.01"
                value={amountTendered || ""}
                onChange={(e) => setAmountTendered(Number(e.target.value) || 0)}
              />
              {amountTendered > 0 && (
                <p className="text-sm text-muted-foreground">
                  Change: <span className="font-medium text-foreground">{formatCurrency(change)}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit || checkout.isPending}>
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
