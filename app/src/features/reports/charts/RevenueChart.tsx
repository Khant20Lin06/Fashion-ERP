"use client"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { chartColors } from "@/components/charts/chart-colors"
import { formatCurrency } from "@/lib/format"
import type { RevenueTrendPoint, SalesPerformancePoint } from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

type RevenueChartProps = { data: RevenueTrendPoint[]; height?: number }

/** Revenue trend — area chart. */
export function RevenueChart({ data, height = 280 }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="reportRevenueFill" x1="0" y1="0" x2="0" y2="1">
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
          fill="url(#reportRevenueFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

type SalesPerformanceChartProps = { data: SalesPerformancePoint[]; height?: number }

/** Sales Performance — Target vs Actual bar comparison, for the Executive Dashboard. */
export function SalesPerformanceChart({ data, height = 280 }: SalesPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="target" name="Target" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" name="Actual" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
