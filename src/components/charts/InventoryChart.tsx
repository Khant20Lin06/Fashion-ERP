"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { formatNumber } from "@/lib/format"
import { categoricalPalette, chartColors } from "./chart-colors"
import type { StockDistributionPoint } from "@/features/dashboard/types"

type InventoryChartProps = {
  data: StockDistributionPoint[]
  height?: number
}

/** Stock distribution across warehouses. */
export function InventoryChart({ data, height = 260 }: InventoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="warehouse" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke={chartColors.muted}
          tickFormatter={(value: number) => formatNumber(value)}
          width={56}
        />
        <Tooltip
          formatter={(value) => formatNumber(Number(value))}
          contentStyle={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            backgroundColor: "var(--popover)",
            color: "var(--popover-foreground)",
            fontSize: 13,
          }}
        />
        <Bar dataKey="quantity" name="Units in stock" radius={[6, 6, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
