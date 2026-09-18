"use client"

import { useState } from "react"
import { AlertCircle, Clock, KeyRound, LogOut, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatRelativeTime } from "@/lib/format"
import { useCurrentShift } from "../hooks/usePosShift"
import { OpenShiftDialog } from "./OpenShiftDialog"
import { CloseShiftDialog } from "./CloseShiftDialog"

export function PosShiftBar() {
  const { data: currentShift, isLoading } = useCurrentShift()
  const [openShiftModal, setOpenShiftModal] = useState(false)
  const [closeShiftModal, setCloseShiftModal] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-11 items-center justify-between border-b bg-muted/30 px-4 text-xs text-muted-foreground animate-pulse">
        <span>Checking POS Shift status...</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-2 text-sm shadow-2xs">
        {currentShift && currentShift.status === "OPEN" ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-semibold tracking-tight">
                Shift #{currentShift.shiftNumber}
              </span>
              <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 text-xs">
                Active Shift
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wallet className="size-3.5" />
              <span>Float:</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(parseFloat(currentShift.openingCash || "0"))}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span>Opened {formatRelativeTime(currentShift.openedAt)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200 text-xs font-medium">
            <AlertCircle className="size-4 text-amber-600 shrink-0" />
            <span>No Active POS Shift. Open a shift with starting cash float to start sales.</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {currentShift && currentShift.status === "OPEN" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCloseShiftModal(true)}
              className="gap-1.5 text-xs h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-3.5" />
              End Shift & Z-Report
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setOpenShiftModal(true)}
              className="gap-1.5 text-xs h-8"
            >
              <KeyRound className="size-3.5" />
              Open Shift
            </Button>
          )}
        </div>
      </div>

      <OpenShiftDialog
        open={openShiftModal}
        onOpenChange={setOpenShiftModal}
      />

      <CloseShiftDialog
        shift={currentShift ?? null}
        open={closeShiftModal}
        onOpenChange={setCloseShiftModal}
      />
    </>
  )
}
