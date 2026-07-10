"use client"

import {
  LineChart,
  Line,
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
import { formatNumber } from "@/lib/format"
import type {
  CustomerGrowthPoint,
  CustomerSegmentPoint,
  PurchaseFrequencyPoint,
  SpendingDistributionPoint,
} from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

const segmentLabels: Record<string, string> = { vip: "VIP", regular: "Regular", new: "New", inactive: "Inactive" }

type CustomerGrowthChartProps = { data: CustomerGrowthPoint[]; height?: number }

/** Customer Growth — new vs total customers over time. */
export function CustomerGrowthChart({ data, height = 280 }: CustomerGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={48} />
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line type="monotone" dataKey="newCustomers" name="New Customers" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="totalCustomers" name="Total Customers" stroke="var(--chart-5)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

type CustomerSegmentChartProps = { data: CustomerSegmentPoint[]; height?: number }

/** Customer Segmentation — VIP / Regular / New / Inactive — donut chart. */
export function CustomerSegmentChart({ data, height = 260 }: CustomerSegmentChartProps) {
  const labeled = data.map((d) => ({ ...d, label: segmentLabels[d.segment] ?? d.segment }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={labeled} dataKey="count" nameKey="label" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {labeled.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

type PurchaseFrequencyChartProps = { data: PurchaseFrequencyPoint[]; height?: number }

/** Purchase Frequency distribution — bar chart. */
export function PurchaseFrequencyChart({ data, height = 260 }: PurchaseFrequencyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="bucket" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={48} />
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Bar dataKey="customerCount" name="Customers" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

type SpendingDistributionChartProps = { data: SpendingDistributionPoint[]; height?: number }

/** Spending Distribution — customer count per spending bucket. */
export function SpendingDistributionChart({ data, height = 260 }: SpendingDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="bucket" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={48} />
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Bar dataKey="customerCount" name="Customers" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
