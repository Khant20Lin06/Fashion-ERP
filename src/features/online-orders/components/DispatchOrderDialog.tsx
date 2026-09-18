"use client"

import { useState } from "react"
import { DollarSign, Send, Truck } from "lucide-react"
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
import { useDispatchOnlineOrder } from "../hooks/useOnlineOrders"
import type { OnlineOrder } from "../types"

type DispatchOrderDialogProps = {
  order: OnlineOrder
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COURIER_OPTIONS = [
  "Royal Express",
  "Kargo Logistics",
  "Ninja Van",
  "In-house Rider",
  "Grab Express",
  "Other Courier",
]

export function DispatchOrderDialog({
  order,
  open,
  onOpenChange,
}: DispatchOrderDialogProps) {
  const [courierService, setCourierService] = useState(COURIER_OPTIONS[0])
  const [trackingNumber, setTrackingNumber] = useState("")
  const [riderName, setRiderName] = useState("")
  const [riderPhone, setRiderPhone] = useState("")
  
  // Default COD amount to grand total if available
  const defaultTotal = order.sale?.grandTotal ? String(order.sale.grandTotal) : "0.00"
  const [codAmount, setCodAmount] = useState(defaultTotal)

  const dispatchMutation = useDispatchOnlineOrder()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await dispatchMutation.mutateAsync({
      id: order.id,
      payload: {
        courierService,
        trackingNumber: trackingNumber.trim() || undefined,
        codAmount: codAmount.trim() || undefined,
        riderName: riderName.trim() || undefined,
        riderPhone: riderPhone.trim() || undefined,
      },
    })
    onOpenChange(false)
  }

  const isInHouse = courierService === "In-house Rider" || courierService === "Grab Express"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Truck className="size-5" />
              <DialogTitle>Dispatch Order for Delivery</DialogTitle>
            </div>
            <DialogDescription>
              Assign a courier or rider and specify Waybill & COD amount for{" "}
              {order.sale?.saleNumber || order.sale?.orderNumber || "Order"}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="courierService">Courier / Delivery Service *</Label>
              <select
                id="courierService"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={courierService}
                onChange={(e) => setCourierService(e.target.value)}
                required
              >
                {COURIER_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="trackingNumber">Waybill / Tracking Number</Label>
              <Input
                id="trackingNumber"
                placeholder="e.g. RE-2026-98124"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>

            {isInHouse && (
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="riderName">Rider Name</Label>
                  <Input
                    id="riderName"
                    placeholder="Ko Aung"
                    value={riderName}
                    onChange={(e) => setRiderName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="riderPhone">Rider Phone</Label>
                  <Input
                    id="riderPhone"
                    placeholder="09..."
                    value={riderPhone}
                    onChange={(e) => setRiderPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="codAmount">Cash on Delivery (COD) Amount (MMK)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="codAmount"
                  type="number"
                  step="100"
                  min="0"
                  className="pl-9 font-mono font-medium"
                  placeholder="0.00"
                  value={codAmount}
                  onChange={(e) => setCodAmount(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave 0 if customer already prepaid via mobile banking.
              </p>
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
            <Button type="submit" disabled={dispatchMutation.isPending} className="gap-2">
              <Send className="size-4" />
              {dispatchMutation.isPending ? "Dispatching..." : "Confirm Dispatch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
