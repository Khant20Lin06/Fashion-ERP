/**
 * 8pt grid spacing system. Values in px for documentation clarity;
 * consumed as rem via Tailwind's spacing scale (4px = 1 Tailwind unit).
 */

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
} as const

export type SpacingToken = keyof typeof spacing

export const breakpoints = {
  mobile: "360px",
  tablet: "768px",
  laptop: "1024px",
  desktop: "1440px",
  largeDesktop: "1920px",
} as const

export const grid = {
  desktop: { columns: 12, gutter: "24px", margin: "24px" },
  tablet: { columns: 8, gutter: "16px", margin: "20px" },
  mobile: { columns: 4, gutter: "12px", margin: "16px" },
  containerMaxWidth: "1440px",
} as const
