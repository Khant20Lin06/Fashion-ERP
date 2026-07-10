"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartSkeleton } from "@/components/ui/chart-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { SalesTrendChart } from "@/components/charts/SalesTrendChart"
import type { SalesTrendGranularity, SalesTrendPoint } from "../types"

type SalesOverviewProps = {
  data: SalesTrendPoint[] | undefined
  granularity: SalesTrendGranularity
  onGranularityChange: (value: SalesTrendGranularity) => void
  isLoading: boolean
  isError?: boolean
  onRetry?: () => void
}

/** Sales analytics widget with a Daily/Weekly/Monthly granularity toggle. */
export function SalesOverview({
  data,
  granularity,
  onGranularityChange,
  isLoading,
  isError,
  onRetry,
}: SalesOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Analytics</CardTitle>
        <CardDescription>Sales performance over time</CardDescription>
        <CardAction>
          <Tabs value={granularity} onValueChange={(v) => onGranularityChange(v as SalesTrendGranularity)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : isError ? (
          <ErrorState message="Couldn't load sales trend data." onRetry={onRetry} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No sales data available" description="Sales trends will appear here once transactions are recorded." />
        ) : (
          <SalesTrendChart data={data} />
        )}
      </CardContent>
    </Card>
  )
}
