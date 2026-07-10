/**
 * Border radius scale. Applied consistently: Buttons/Inputs/Cards = md,
 * Dialogs/Drawers/large Cards = lg, Chips/Badges = sm, Avatars/Pills = full.
 */

export const radius = {
  none: "0px",
  small: "0.25rem",
  medium: "0.5rem",
  large: "0.75rem",
  extraLarge: "1rem",
  full: "9999px",
} as const

export type RadiusToken = keyof typeof radius
