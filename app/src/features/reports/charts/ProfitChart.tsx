"use client"

import {
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
import { formatCurrency, formatPercent } from "@/lib/format"
import type { ExpenseBreakdownPoint, MarginAnalysisPoint, ProfitTrendPoint } from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

type ProfitTrendChartProps = { data: ProfitTrendPoint[]; height?: number }

/** Profit Trend — line chart. */
export function ProfitTrendChart({ data, height = 280 }: ProfitTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
        <Line type="monotone" dataKey="profit" name="Profit" stroke={chartColors.primary} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

type ExpenseBreakdownChartProps = { data: ExpenseBreakdownPoint[]; height?: number }

/** Expense Breakdown — donut chart. */
export function ExpenseBreakdownChart({ data, height = 260 }: ExpenseBreakdownChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="amount" nameKey="category" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

type MarginAnalysisChartProps = { data: MarginAnalysisPoint[]; height?: number }

/** Margin Analysis — gross vs net margin % over time. */
export function MarginAnalysisChart({ data, height = 280 }: MarginAnalysisChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke={chartColors.muted}
          tickFormatter={(value: number) => `${value}%`}
          width={48}
        />
        <Tooltip formatter={(value) => formatPercent(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line type="monotone" dataKey="grossMarginPercent" name="Gross Margin" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="netMarginPercent" name="Net Margin" stroke="var(--chart-5)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
