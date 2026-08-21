"use client"

import { PackagePlus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import type { LowStockItem } from "../types"

type LowStockAlertProps = {
  data: LowStockItem[] | undefined
  isLoading: boolean
  isError?: boolean
  onRetry?: () => void
  onReorder?: (item: LowStockItem) => void
  /** True when the data source itself doesn't yet exist (vs. a genuinely-empty real result) — swaps the empty-state copy so "no alerts" isn't confused with "not tracked yet." */
  unavailable?: boolean
}

export function LowStockAlert({ data, isLoading, isError, onRetry, onReorder, unavailable }: LowStockAlertProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Alerts</CardTitle>
        <CardDescription>Items below their reorder level</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={4} columns={3} />
        ) : isError ? (
          <ErrorState message="Couldn't load stock alerts." onRetry={onRetry} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title={unavailable ? "Low stock tracking not yet available" : "All stock levels healthy"}
            description={
              unavailable
                ? "Reorder-level tracking isn't supported by the backend yet."
                : "No items are currently below their reorder level."
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {data.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.sku} · {item.warehouse}
                  </p>
                </div>
                <Badge variant="destructive" className="shrink-0">
                  {item.quantityRemaining} left
                </Badge>
                {onReorder && (
                  <Button size="icon" variant="ghost" onClick={() => onReorder(item)} aria-label={`Reorder ${item.name}`}>
                    <PackagePlus className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
