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
import { formatCurrency } from "@/lib/format"
import type { CategorySalesPoint, PaymentMethodSalesPoint } from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

type CategorySalesChartProps = { data: CategorySalesPoint[]; height?: number }

/** Sales By Category — Men / Women / Kids / Accessories — donut chart. */
export function CategorySalesChart({ data, height = 260 }: CategorySalesChartProps) {
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

type PaymentMethodChartProps = { data: PaymentMethodSalesPoint[]; height?: number }

/** Sales By Payment Method — Cash / Card / Transfer / Mobile — bar chart. */
export function PaymentMethodChart({ data, height = 260 }: PaymentMethodChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="method" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke={chartColors.muted}
          tickFormatter={(value: number) => formatCurrency(value)}
          width={64}
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
        <Bar dataKey="amount" name="Sales" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
