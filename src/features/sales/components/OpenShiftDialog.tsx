"use client"

import { useState } from "react"
import { DollarSign, KeyRound } from "lucide-react"
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
import { useOpenShift } from "../hooks/usePosShift"

type OpenShiftDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  branchId?: string
}

export function OpenShiftDialog({
  open,
  onOpenChange,
  branchId = "edd46c22-e951-4e17-b24c-7d2cba87a2ce", // default branch
}: OpenShiftDialogProps) {
  const [openingCash, setOpeningCash] = useState("50000")
  const [notes, setNotes] = useState("")
  const openShiftMutation = useOpenShift()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await openShiftMutation.mutateAsync({
      branchId,
      openingCash,
      notes: notes.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <KeyRound className="size-5" />
              <DialogTitle>Start POS Shift</DialogTitle>
            </div>
            <DialogDescription>
              Open a new cash drawer session. Enter your starting cash float.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="openingCash">Starting Cash Float (MMK)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="openingCash"
                  type="number"
                  step="100"
                  min="0"
                  className="pl-9 font-mono"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Amount of cash in drawer at start of shift (e.g. for making change).
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="shiftNotes">Notes (Optional)</Label>
              <Input
                id="shiftNotes"
                placeholder="e.g. Morning Counter 1"
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
            <Button type="submit" disabled={openShiftMutation.isPending}>
              {openShiftMutation.isPending ? "Starting Shift..." : "Open Shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
