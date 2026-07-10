"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { InventoryChart } from "@/components/charts/InventoryChart"
import type { StockDistributionPoint } from "../types"

type InventoryStatusProps = {
  data: StockDistributionPoint[] | undefined
  isLoading: boolean
  isError?: boolean
  onRetry?: () => void
}

export function InventoryStatus({ data, isLoading, isError, onRetry }: InventoryStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
        <CardDescription>Stock distribution by warehouse</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton height={260} />
        ) : isError ? (
          <ErrorState message="Couldn't load inventory data." onRetry={onRetry} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No inventory data available" description="Stock levels will appear here once warehouses are stocked." />
        ) : (
          <InventoryChart data={data} />
        )}
      </CardContent>
    </Card>
  )
}
