"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency, formatNumber } from "@/lib/format"
import { chartColors } from "./chart-colors"
import type { SalesTrendPoint } from "@/features/dashboard/types"

type SalesTrendChartProps = {
  data: SalesTrendPoint[]
  height?: number
}

export function SalesTrendChart({ data, height = 280 }: SalesTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis
          yAxisId="sales"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke={chartColors.muted}
          tickFormatter={(value: number) => formatCurrency(value)}
          width={72}
        />
        <Tooltip
          formatter={(value, name) =>
            name === "Sales" ? formatCurrency(Number(value)) : formatNumber(Number(value))
          }
          contentStyle={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--popover)",
            color: "var(--popover-foreground)",
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line
          yAxisId="sales"
          type="monotone"
          dataKey="sales"
          name="Sales"
          stroke={chartColors.primary}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
