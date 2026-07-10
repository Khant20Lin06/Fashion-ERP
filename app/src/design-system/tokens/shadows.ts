/**
 * Elevation levels. Used sparingly — shadows primarily denote overlays
 * (dropdowns, modals, floating elements), not resting surfaces.
 */

export const shadows = {
  level0: "none",
  level1: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
  level2: "0 2px 4px rgba(16,24,40,0.08), 0 4px 8px rgba(16,24,40,0.10)",
  level3: "0 4px 8px rgba(16,24,40,0.10), 0 8px 16px rgba(16,24,40,0.12)",
  level4: "0 8px 16px rgba(16,24,40,0.12), 0 16px 32px rgba(16,24,40,0.14)",
} as const

export type ShadowToken = keyof typeof shadows
