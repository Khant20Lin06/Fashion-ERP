"use client"

import { useState } from "react"
import { CheckCircle2, DollarSign, Wallet } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/format"
import { useSettleOnlineOrderCod } from "../hooks/useOnlineOrders"
import type { OnlineOrder } from "../types"

type SettleCodDialogProps = {
  order: OnlineOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettleCodDialog({
  order,
  open,
  onOpenChange,
}: SettleCodDialogProps) {
  const expectedAmount = order.codAmount ? String(order.codAmount) : "0.00"
  const [collectedAmount, setCollectedAmount] = useState(expectedAmount)
  const [notes, setNotes] = useState("")

  const settleMutation = useSettleOnlineOrderCod()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await settleMutation.mutateAsync({
      id: order.id,
      payload: {
        collectedAmount,
        notes: notes.trim() || undefined,
      },
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Wallet className="size-5" />
              <DialogTitle>Settle Cash on Delivery (COD)</DialogTitle>
            </div>
            <DialogDescription>
              Reconcile cash received from courier/rider for{" "}
              {order.sale?.saleNumber || order.sale?.orderNumber || "Order"}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Courier Service:</span>
                <span className="font-medium">{order.courierService || "Standard"}</span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waybill #:</span>
                  <span className="font-mono">{order.trackingNumber}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-1.5 font-medium">
                <span>Expected COD Amount:</span>
                <span className="font-mono text-primary font-semibold">
                  {formatCurrency(parseFloat(expectedAmount))}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="collectedAmount">Actual Cash Collected (MMK) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="collectedAmount"
                  type="number"
                  step="100"
                  min="0"
                  className="pl-9 font-mono font-medium"
                  value={collectedAmount}
                  onChange={(e) => setCollectedAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="settleNotes">Remarks (Optional)</Label>
              <Input
                id="settleNotes"
                placeholder="e.g. Received via Rider Ko Aung"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={settleMutation.isPending}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="size-4" />
              {settleMutation.isPending ? "Settling..." : "Confirm & Settle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
