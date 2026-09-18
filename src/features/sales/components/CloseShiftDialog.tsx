"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle2, DollarSign, Receipt, TrendingDown, TrendingUp } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useCloseShift } from "../hooks/usePosShift"
import type { PosShift } from "../types"

type CloseShiftDialogProps = {
  shift?: PosShift | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CloseShiftDialog({
  shift,
  open,
  onOpenChange,
}: CloseShiftDialogProps) {
  const [actualCash, setActualCash] = useState("")
  const [notes, setNotes] = useState("")
  const closeShiftMutation = useCloseShift()

  if (!shift) return null

  const openingFloat = parseFloat(shift.openingCash || "0")
  const expectedCash = parseFloat(shift.expectedCash || "0")
  const counted = parseFloat(actualCash || "0")
  const difference = counted - expectedCash
  const hasCounted = actualCash !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasCounted) return

    await closeShiftMutation.mutateAsync({
      shiftId: shift.id,
      payload: {
        actualCash,
        notes: notes.trim() || undefined,
      },
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <Receipt className="size-5" />
              <DialogTitle>End POS Shift / Z-Report</DialogTitle>
            </div>
            <DialogDescription>
              Reconcile cash drawer for Shift #{shift.shiftNumber} (Opened{" "}
              {formatRelativeTime(shift.openedAt)}).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cashier:</span>
                <span className="font-medium">
                  {shift.cashier?.displayName || shift.cashier?.firstName || "Cashier"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Starting Cash Float:</span>
                <span className="font-mono">{formatCurrency(openingFloat)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Expected Drawer Total:</span>
                <span className="font-mono text-primary font-semibold">
                  {formatCurrency(expectedCash)}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="actualCash">Counted Drawer Cash (MMK) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="actualCash"
                  type="number"
                  step="100"
                  min="0"
                  placeholder="Count all physical cash and enter total..."
                  className="pl-9 font-mono text-base font-semibold"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {hasCounted && (
              <div className="rounded-lg border p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {difference === 0 ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : difference > 0 ? (
                    <TrendingUp className="size-4 text-purple-600" />
                  ) : (
                    <TrendingDown className="size-4 text-destructive" />
                  )}
                  <span>Reconciliation Discrepancy:</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    difference === 0
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : difference > 0
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-destructive bg-destructive/10 text-destructive"
                  }
                >
                  {difference === 0
                    ? "Balanced (Exact)"
                    : difference > 0
                    ? `Over by +${formatCurrency(difference)}`
                    : `Short by -${formatCurrency(Math.abs(difference))}`}
                </Badge>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="closeNotes">Closing Notes (Optional)</Label>
              <Input
                id="closeNotes"
                placeholder="Discrepancy explanation or handover remarks..."
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
              variant="destructive"
              disabled={closeShiftMutation.isPending || !hasCounted}
            >
              {closeShiftMutation.isPending ? "Closing Shift..." : "Confirm & Close Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
