export function buildPosPageClassName(className?: string): string {
  return ["h-full", "overflow-hidden", className].filter(Boolean).join(" ")
}

export function buildPosLayoutClassName(className?: string): string {
  return [
    "grid",
    "grid-cols-1",
    "items-start",
    "gap-4",
    "lg:h-full",
    "lg:grid-cols-[1fr_360px]",
    "xl:grid-cols-[1fr_400px]",
    className,
  ]
    .filter(Boolean)
    .join(" ")
}

export function buildPosPaneClassName(className?: string): string {
  return ["min-h-0", "lg:h-full", className].filter(Boolean).join(" ")
}

export function buildPosScrollablePaneClassName(className?: string): string {
  return ["flex", "min-h-0", "flex-col", "lg:h-full", className].filter(Boolean).join(" ")
}

export function buildPosNativeScrollRegionClassName(className?: string): string {
  return [
    "min-h-0",
    "overflow-y-auto",
    "pr-1",
    "[scrollbar-color:var(--color-border)_transparent]",
    "[scrollbar-width:auto]",
    "[&::-webkit-scrollbar]:w-2.5",
    "[&::-webkit-scrollbar-thumb]:rounded-full",
    "[&::-webkit-scrollbar-thumb]:bg-border",
    "[&::-webkit-scrollbar-track]:bg-transparent",
    className,
  ]
    .filter(Boolean)
    .join(" ")
}

export function buildCartItemsRegionClassName(className?: string): string {
  return buildPosNativeScrollRegionClassName(["flex-1", className].filter(Boolean).join(" "))
}
