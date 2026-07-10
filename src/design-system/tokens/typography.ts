/**
 * Enterprise typography scale.
 * Sizes in rem, line-heights unitless multipliers per Tailwind convention.
 */

export const fontFamily = {
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
} as const

export type TypographyStyle = {
  fontSize: string
  lineHeight: string
  fontWeight: number
  letterSpacing?: string
}

export const typography = {
  display: { fontSize: "2.25rem", lineHeight: "2.75rem", fontWeight: 700, letterSpacing: "-0.02em" },
  headingLarge: { fontSize: "1.75rem", lineHeight: "2.25rem", fontWeight: 700, letterSpacing: "-0.01em" },
  headingMedium: { fontSize: "1.25rem", lineHeight: "1.75rem", fontWeight: 600 },
  headingSmall: { fontSize: "1rem", lineHeight: "1.5rem", fontWeight: 600 },

  bodyLarge: { fontSize: "1rem", lineHeight: "1.5rem", fontWeight: 400 },
  bodyMedium: { fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: 400 },
  bodySmall: { fontSize: "0.8125rem", lineHeight: "1.125rem", fontWeight: 400 },
  caption: { fontSize: "0.75rem", lineHeight: "1rem", fontWeight: 400, letterSpacing: "0.01em" },

  labelLarge: { fontSize: "0.8125rem", lineHeight: "1rem", fontWeight: 500 },
  labelMedium: { fontSize: "0.75rem", lineHeight: "1rem", fontWeight: 500 },
  labelSmall: {
    fontSize: "0.6875rem",
    lineHeight: "1rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
  },
} satisfies Record<string, TypographyStyle>

export type TypographyToken = keyof typeof typography
