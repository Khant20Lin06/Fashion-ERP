"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { chartColors } from "@/components/charts/chart-colors"
import { ErrorState } from "@/components/ui/error-state"
import { formatCurrency } from "@/lib/format"
import { useRevenueTrend } from "../hooks/useSales"
import type { RevenueTrendGranularity, SalesReportFilters } from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

/** Revenue Trend widget with Daily/Weekly/Monthly/Yearly granularity toggle. */
export function RevenueTrendChart({ filters }: { filters?: SalesReportFilters }) {
  const [granularity, setGranularity] = useState<RevenueTrendGranularity>("daily")
  const { data, isError, refetch } = useRevenueTrend(granularity, filters)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue Trend</CardTitle>
        <CardAction>
          <Tabs value={granularity} onValueChange={(v) => setGranularity(v as RevenueTrendGranularity)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isError ? (
          <ErrorState message="Couldn't load revenue trend." onRetry={refetch} />
        ) : !data || data.length === 0 ? (
          <EmptyState title="No revenue trend data" description="Completed sales in the selected range will appear here." />
        ) : (
        <ResponsiveContainer key={granularity} width="99%" height={280}>
          <AreaChart data={data ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.25} />
                <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke={chartColors.muted}
              tickFormatter={(value: number) => formatCurrency(value)}
              width={72}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={chartColors.primary}
              strokeWidth={2}
              fill="url(#salesRevenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
