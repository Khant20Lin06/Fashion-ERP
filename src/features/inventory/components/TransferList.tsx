"use client"

import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/format"
import { useTransfers } from "../hooks/useStockMovement"

/** Transfer history list. Real backend StockTransfers are create-only/atomic
 * (Phase 14 D9/D22, LOCKED) — no draft/approval/completion workflow exists,
 * so every listed transfer already moved stock the moment it was created. */
export function TransferList() {
  const { data, isLoading, isError, refetch } = useTransfers()

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
      {data.map((transfer) => (
        <Card key={transfer.id}>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium">{transfer.reference}</p>
                <Badge variant="default">Completed</Badge>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span>{transfer.fromWarehouseName}</span>
                <ArrowRight className="size-3.5" />
                <span>{transfer.toWarehouseName}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {transfer.items.length} item(s) - Created by {transfer.createdBy} - {formatRelativeTime(transfer.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
