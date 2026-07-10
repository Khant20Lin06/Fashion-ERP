"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, formatRelativeTime } from "@/lib/format"
import { useStockAdjustments } from "../hooks/useStockMovement"
import type { AdjustmentStatus, AdjustmentType } from "../types"

const typeLabels: Record<AdjustmentType, string> = {
  stock_count_difference: "Stock Count Difference",
  damaged_product: "Damaged Product",
  lost_item: "Lost Item",
  expired_item: "Expired Item",
  manual_correction: "Manual Correction",
}

const statusVariant: Record<AdjustmentStatus, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
}

/** Recent stock adjustments — pending approval, approved, rejected. */
export function AdjustmentList() {
  const { data, isLoading, isError, refetch } = useStockAdjustments()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (isError) return <ErrorState message="Couldn't load adjustments." onRetry={refetch} />

  if (!data || data.length === 0) {
    return <EmptyState title="No adjustments yet" description="Submitted adjustments will appear here." />
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((adjustment) => (
        <Card key={adjustment.id}>
          <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium">{adjustment.reference}</p>
                <Badge variant={statusVariant[adjustment.status]} className="capitalize">
                  {adjustment.status}
                </Badge>
                <Badge variant="outline">{typeLabels[adjustment.type]}</Badge>
              </div>
              <p className="text-sm">
                {adjustment.productName}
                {adjustment.variantLabel ? ` (${adjustment.variantLabel})` : ""} · {adjustment.warehouseName}
              </p>
              <p className="text-xs text-muted-foreground">{adjustment.reason}</p>
              <p className="text-xs text-muted-foreground">
                {adjustment.createdBy} · {formatRelativeTime(adjustment.createdAt)}
              </p>
            </div>
            <p className={adjustment.difference > 0 ? "font-semibold text-success" : adjustment.difference < 0 ? "font-semibold text-destructive" : "font-semibold"}>
              {adjustment.difference > 0 ? "+" : ""}
              {formatNumber(adjustment.difference)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
