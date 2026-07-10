"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { chartColors } from "@/components/charts/chart-colors"
import { formatCurrency } from "@/lib/format"
import type { PurchaseTrendPoint } from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

type PurchaseTrendChartProps = { data: PurchaseTrendPoint[]; height?: number }

/** Monthly purchase amount trend — area chart. */
export function PurchaseTrendChart({ data, height = 280 }: PurchaseTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="purchaseTrendFill" x1="0" y1="0" x2="0" y2="1">
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
          dataKey="amount"
          name="Purchase Amount"
          stroke={chartColors.primary}
          strokeWidth={2}
          fill="url(#purchaseTrendFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
