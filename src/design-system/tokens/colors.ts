/**
 * Enterprise semantic color tokens.
 * These are the canonical values — Tailwind's CSS variables (globals.css @theme)
 * and shadcn component styling both derive from this same source. Never hardcode
 * a hex/oklch value in a component; reference a semantic token instead.
 */

export const brandColors = {
  primary: "oklch(0.42 0.17 259)", // Enterprise blue — primary actions, active nav, links
  secondary: "oklch(0.35 0.02 259)", // Secondary emphasis actions
  accent: "oklch(0.55 0.18 300)", // Highlights, promotional callouts (sparingly)
} as const

export const statusColors = {
  success: "oklch(0.6 0.15 155)", // Positive status, in-stock, completed
  warning: "oklch(0.75 0.16 75)", // Low stock, pending, expiring
  danger: "oklch(0.58 0.22 25)", // Out-of-stock, failed, destructive
  info: "oklch(0.62 0.13 230)", // Informational banners, tips
} as const

export const neutralColors = {
  background: "oklch(0.98 0 0)",
  surface: "oklch(1 0 0)",
  border: "oklch(0.9 0 0)",
  divider: "oklch(0.93 0 0)",
  textPrimary: "oklch(0.15 0 0)",
  textSecondary: "oklch(0.45 0 0)",
  disabled: "oklch(0.7 0 0)",
} as const

export const dataVisualizationColors = {
  chartPrimary: brandColors.primary,
  chartSecondary: brandColors.accent,
  revenue: statusColors.success,
  profit: statusColors.success,
  loss: statusColors.danger,
  growth: statusColors.success,
  risk: statusColors.warning,
  categorical: [
    "oklch(0.42 0.17 259)",
    "oklch(0.55 0.18 300)",
    "oklch(0.62 0.13 230)",
    "oklch(0.75 0.16 75)",
    "oklch(0.6 0.15 155)",
    "oklch(0.55 0.2 350)",
    "oklch(0.65 0.16 130)",
    "oklch(0.5 0.02 259)",
  ],
} as const

export const colors = {
  brand: brandColors,
  status: statusColors,
  neutral: neutralColors,
  dataViz: dataVisualizationColors,
} as const

export type BrandColorToken = keyof typeof brandColors
export type StatusColorToken = keyof typeof statusColors
export type NeutralColorToken = keyof typeof neutralColors
