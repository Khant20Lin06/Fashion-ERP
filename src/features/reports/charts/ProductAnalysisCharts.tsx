"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts"
import { categoricalPalette, chartColors } from "@/components/charts/chart-colors"
import type { ColorAnalysisPoint, SizeAnalysisPoint } from "../types"

const tooltipStyle = {
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  backgroundColor: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 13,
}

type SizeAnalysisChartProps = { data: SizeAnalysisPoint[]; height?: number }

/** Size Analysis — e.g. "M sells 45%, L sells 35%, XL sells 20%". */
export function SizeAnalysisChart({ data, height = 240 }: SizeAnalysisChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} tickFormatter={(v: number) => `${v}%`} />
        <YAxis type="category" dataKey="size" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={40} />
        <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
        <Bar dataKey="percentSold" name="% Sold" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

type ColorAnalysisChartProps = { data: ColorAnalysisPoint[]; height?: number }

/** Color Analysis — % sold by color. */
export function ColorAnalysisChart({ data, height = 240 }: ColorAnalysisChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} tickFormatter={(v: number) => `${v}%`} />
        <YAxis type="category" dataKey="color" tickLine={false} axisLine={false} fontSize={12} stroke={chartColors.muted} width={56} />
        <Tooltip formatter={(value) => `${value}%`} contentStyle={tooltipStyle} />
        <Bar dataKey="percentSold" name="% Sold" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={categoricalPalette[index % categoricalPalette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
