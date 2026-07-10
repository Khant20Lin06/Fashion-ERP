"use client"

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { categoricalPalette, chartColors } from "@/components/charts/chart-colors"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { InventoryAgingBucket, StockDistributionPoint, StockMovementPoint } from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

type StockDistributionChartProps = { data: StockDistributionPoint[]; valueFormat?: "currency" | "number"; height?: number }

/** Stock Distribution — by Warehouse / Category / Brand — donut chart. */
export function StockDistributionChart({ data, valueFormat = "number", height = 260 }: StockDistributionChartProps) {
  const format = valueFormat === "currency" ? formatCurrency : formatNumber
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => format(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

type StockMovementChartProps = { data: StockMovementPoint[]; height?: number }

/** Stock Movement — Incoming / Outgoing / Adjustment bar chart. */
export function StockMovementChart({ data, height = 280 }: StockMovementChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={48} />
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="incoming" name="Incoming" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="outgoing" name="Outgoing" fill={chartColors.destructive} radius={[4, 4, 0, 0]} />
        <Bar dataKey="adjustment" name="Adjustment" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

type InventoryAgingChartProps = { data: InventoryAgingBucket[]; height?: number }

/** Inventory Aging — 0-30 / 30-90 / 90+ days buckets. */
export function InventoryAgingChart({ data, height = 240 }: InventoryAgingChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis type="category" dataKey="bucket" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={64} />
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Bar dataKey="quantity" name="Quantity" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
