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
  Cell,
  ResponsiveContainer,
} from "recharts"
import { categoricalPalette, chartColors } from "@/components/charts/chart-colors"
import { formatCurrency } from "@/lib/format"
import type { CostChangePoint, PurchaseTrendPoint, SupplierComparisonPoint } from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

type PurchaseTrendChartProps = { data: PurchaseTrendPoint[]; height?: number }

/** Purchase Trend — monthly purchase amount, area chart. */
export function PurchaseTrendChart({ data, height = 280 }: PurchaseTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="reportPurchaseTrendFill" x1="0" y1="0" x2="0" y2="1">
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
        <Area type="monotone" dataKey="amount" name="Purchase Amount" stroke={chartColors.primary} strokeWidth={2} fill="url(#reportPurchaseTrendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

type SupplierComparisonChartProps = { data: SupplierComparisonPoint[]; height?: number }

/** Supplier Comparison — purchase amount per supplier, bar chart. */
export function SupplierComparisonChart({ data, height = 280 }: SupplierComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="supplierName" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke={chartColors.muted}
          tickFormatter={(value: number) => formatCurrency(value)}
          width={72}
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
        <Bar dataKey="amount" name="Purchase Amount" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

type CostChangeChartProps = { data: CostChangePoint[]; height?: number }

/** Cost Change Analysis — previous vs current cost per product, grouped bar chart. */
export function CostChangeChart({ data, height = 280 }: CostChangeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="productName" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke={chartColors.muted}
          tickFormatter={(value: number) => formatCurrency(value)}
          width={56}
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="previousCost" name="Previous Cost" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="currentCost" name="Current Cost" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
