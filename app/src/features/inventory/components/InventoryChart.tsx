"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import type { CategoryStockPoint, MovementTrendPoint, StockValuePoint } from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

type StockValueChartProps = { data: StockValuePoint[]; height?: number }

/** Stock value by warehouse — bar chart. */
export function StockValueChart({ data, height = 260 }: StockValueChartProps) {
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
          tickFormatter={(value: number) => formatCurrency(value)}
          width={72}
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
        <Bar dataKey="value" name="Stock Value" radius={[6, 6, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

type CategoryStockChartProps = { data: CategoryStockPoint[]; height?: number }

/** Category stock distribution — donut chart. */
export function CategoryStockChart({ data, height = 260 }: CategoryStockChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="quantity" nameKey="category" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

type MovementTrendChartProps = { data: MovementTrendPoint[]; height?: number }

/** Incoming vs Outgoing stock movement trend — line chart. */
export function MovementTrendChart({ data, height = 260 }: MovementTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={48} />
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line type="monotone" dataKey="incoming" name="Incoming" stroke={chartColors.success} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="outgoing" name="Outgoing" stroke={chartColors.destructive} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
