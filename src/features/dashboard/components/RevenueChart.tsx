"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { RevenueChart as RevenueChartViz } from "@/components/charts/RevenueChart"
import type { RevenuePoint } from "../types"

type RevenueChartWidgetProps = {
  data: RevenuePoint[] | undefined
  isLoading: boolean
  isError?: boolean
  onRetry?: () => void
}

export function RevenueChartWidget({ data, isLoading, isError, onRetry }: RevenueChartWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>Monthly revenue trend vs. target</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : isError ? (
          <ErrorState message="Couldn't load revenue data." onRetry={onRetry} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No revenue data available" description="Revenue will appear here once sales are recorded." />
        ) : (
          <RevenueChartViz data={data} />
        )}
      </CardContent>
    </Card>
  )
}
