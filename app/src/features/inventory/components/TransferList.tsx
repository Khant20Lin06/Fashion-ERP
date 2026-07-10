"use client"

import { ArrowRight, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/format"
import { useTransfers, useUpdateTransferStatus } from "../hooks/useStockMovement"
import type { TransferStatus } from "../types"

const statusConfig: Record<TransferStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "outline" },
  pending_approval: { label: "Pending Approval", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  completed: { label: "Completed", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

/** Transfer workflow list: Draft -> Pending Approval -> Approved -> Completed, with Manager approval actions. */
export function TransferList() {
  const { data, isLoading, isError, refetch } = useTransfers()
  const { mutate: updateStatus, isPending } = useUpdateTransferStatus()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load transfers." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No transfers yet" description="Create a stock transfer to move inventory between warehouses." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((transfer) => {
        const config = statusConfig[transfer.status]
        return (
          <Card key={transfer.id}>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-medium">{transfer.reference}</p>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span>{transfer.fromWarehouseName}</span>
                  <ArrowRight className="size-3.5" />
                  <span>{transfer.toWarehouseName}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {transfer.items.length} item(s) · Created by {transfer.createdBy} · {formatRelativeTime(transfer.createdAt)}
                </p>
              </div>

              <div className="flex gap-2">
                {transfer.status === "draft" && (
                  <Button size="sm" onClick={() => updateStatus({ id: transfer.id, status: "pending_approval" })} disabled={isPending}>
                    Submit for Approval
                  </Button>
                )}
                {transfer.status === "pending_approval" && (
                  <>
                    <Button size="sm" onClick={() => updateStatus({ id: transfer.id, status: "approved" })} disabled={isPending}>
                      <Check /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus({ id: transfer.id, status: "cancelled" })}
                      disabled={isPending}
                    >
                      <X /> Reject
                    </Button>
                  </>
                )}
                {transfer.status === "approved" && (
                  <Button size="sm" onClick={() => updateStatus({ id: transfer.id, status: "completed" })} disabled={isPending}>
                    Confirm Receipt
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
