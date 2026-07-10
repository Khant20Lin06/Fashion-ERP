/**
 * Chart color palette. Values are CSS variable references so charts
 * automatically follow the active theme's Design Tokens (light/dark)
 * defined in globals.css — never hardcode a hex/oklch value in a chart.
 */
export const categoricalPalette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export const chartColors = {
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  muted: "var(--muted-foreground)",
  grid: "var(--border)",
} as const
