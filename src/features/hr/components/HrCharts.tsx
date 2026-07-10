"use client"

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { categoricalPalette, chartColors } from "@/components/charts/chart-colors"
import { formatNumber, formatPercent } from "@/lib/format"
import type {
  AbsenceTrendPoint,
  AttendanceOverviewPoint,
  DepartmentCostPoint,
  DepartmentDistributionPoint,
  HeadcountGrowthPoint,
  LateTrendPoint,
  SalaryCostPoint,
  TurnoverPoint,
} from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

type AttendanceOverviewChartProps = { data: AttendanceOverviewPoint[]; height?: number }

/** Attendance Overview — Present/Absent/Late grouped bar chart. */
export function AttendanceOverviewChart({ data, height = 280 }: AttendanceOverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={48} />
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="present" name="Present" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="absent" name="Absent" fill={chartColors.destructive} radius={[4, 4, 0, 0]} />
        <Bar dataKey="late" name="Late" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

type DepartmentDistributionChartProps = { data: DepartmentDistributionPoint[]; height?: number }

/** Department Distribution — donut chart. */
export function DepartmentDistributionChart({ data, height = 260 }: DepartmentDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="department" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
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

type HeadcountGrowthChartProps = { data: HeadcountGrowthPoint[]; height?: number }

/** Headcount Growth — line chart, for HR Analytics. */
export function HeadcountGrowthChart({ data, height = 260 }: HeadcountGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={48} />
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="headcount" name="Headcount" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

type TurnoverTrendChartProps = { data: TurnoverPoint[]; height?: number }

/** Turnover Rate — line chart. */
export function TurnoverTrendChart({ data, height = 260 }: TurnoverTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} tickFormatter={(v: number) => `${v}%`} width={48} />
        <Tooltip formatter={(value) => formatPercent(Number(value))} contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="turnoverRatePercent" name="Turnover Rate" stroke={chartColors.destructive} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

type LateAbsenceTrendChartProps = { lateData: LateTrendPoint[]; absenceData: AbsenceTrendPoint[]; height?: number }

/** Late Trends vs Absence Trends — combined line chart. */
export function LateAbsenceTrendChart({ lateData, absenceData, height = 260 }: LateAbsenceTrendChartProps) {
  const merged = lateData.map((point, index) => ({
    period: point.period,
    late: point.lateCount,
    absent: absenceData[index]?.absentCount ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={merged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={48} />
        <Tooltip formatter={(value) => formatNumber(Number(value))} contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line type="monotone" dataKey="late" name="Late" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="absent" name="Absent" stroke={chartColors.destructive} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

type SalaryCostChartProps = { data: SalaryCostPoint[]; height?: number }

/** Salary Cost trend — area-like bar chart. */
export function SalaryCostChart({ data, height = 260 }: SalaryCostChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={64} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="amount" name="Salary Cost" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

type DepartmentCostChartProps = { data: DepartmentCostPoint[]; height?: number }

/** Department Cost — bar chart. */
export function DepartmentCostChart({ data, height = 260 }: DepartmentCostChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
        <XAxis dataKey="department" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={64} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="amount" name="Cost" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
